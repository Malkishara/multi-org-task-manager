import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/card/Card';
import Table from '../../components/table/Table';
import Button from '../../components/button/Button';
import SearchField from '../../components/search-field/SearchField';
import Pagination from '../../components/pagination/Pagination';
import ConfirmModal from '../../components/confirm-modal/ConfirmModal';
import TaskFormModal from '../../components/tasks-form-modal/TaskFormModal';
import TaskStatusModal from '../../components/task-status-modal/TaskStatusModal';
import { projectApi } from '../../apis/projectApi';
import { fetchMembers } from '../../redux/slices/Memberslice';
import {
  fetchTasksByProject,
  fetchAssigneesForProject,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  clearTaskError,
  clearTasks,
  setTaskSearchTerm,
  setTaskAssigneeFilter,
} from '../../redux/slices/taskSlice';
import { canCreateOrDeleteTask } from '../../utils/permissions';
import styles from './Tasks.module.scss';

const STATUS_COLORS = {
  TODO: '#94A3B8',
  IN_PROGRESS: '#3B82F6',
  IN_REVIEW: '#A855F7',
  DONE: '#22C55E',
  CANCELLED: '#EF4444',
};

export default function TasksPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    items: tasks,
    loading: tasksLoading,
    error,
    actionLoadingId,
    searchTerm,
    assignedToId,
    page,
    size,
    totalPages,
    totalElements,
    assignees,
  } = useSelector((state) => state.tasks);

  const { list: members } = useSelector((state) => state.members);

  // Project itself isn't in projectSlice's list when navigated to directly
  // (e.g. page refresh), so it's fetched once here for the header + to
  // know which organization's members to load for the assignee dropdown,
  // and which organization to check task-creation permission against.
  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [statusTarget, setStatusTarget] = useState(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setProjectLoading(true);
    setProjectError(null);

    projectApi
      .getProject(projectId)
      .then((data) => {
        if (cancelled) return;
        setProject(data);
        dispatch(fetchMembers(data.organizationId));
      })
      .catch((err) => {
        if (cancelled) return;
        setProjectError(err.response?.data?.message || 'Failed to load project.');
      })
      .finally(() => {
        if (!cancelled) setProjectLoading(false);
      });

    dispatch(fetchAssigneesForProject(projectId));

    return () => {
      cancelled = true;
      dispatch(clearTasks());
    };
  }, [dispatch, projectId]);

  // Refetch whenever the page changes. Search and assignee filter are
  // handled separately below since they need to force page back to 0.
  useEffect(() => {
    dispatch(fetchTasksByProject({ projectId, search: searchTerm, assignedToId, page, size }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, projectId, page]);

  const handleSearch = (value) => {
    dispatch(setTaskSearchTerm(value));
    dispatch(fetchTasksByProject({ projectId, search: value, assignedToId, page: 0, size }));
  };

  const handleAssigneeChange = (e) => {
    const value = e.target.value ? Number(e.target.value) : null;
    dispatch(setTaskAssigneeFilter(value));
    dispatch(fetchTasksByProject({ projectId, search: searchTerm, assignedToId: value, page: 0, size }));
  };

  const handlePageChange = (nextPage) => {
    dispatch(fetchTasksByProject({ projectId, search: searchTerm, assignedToId, page: nextPage, size }));
  };

  const openCreateForm = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setEditingTask(null);
  };

  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editingTask) {
        await dispatch(updateTask({ id: editingTask.id, payload })).unwrap();
      } else {
        await dispatch(createTask(payload)).unwrap();
      }
      setFormOpen(false);
      setEditingTask(null);
      dispatch(fetchAssigneesForProject(projectId));
    } catch (err) {
      // error captured in redux state
    } finally {
      setSubmitting(false);
    }
  };

  const closeStatusModal = () => {
    if (statusSubmitting) return;
    setStatusTarget(null);
  };

  const handleStatusSubmit = async ({ status }) => {
    setStatusSubmitting(true);
    try {
      await dispatch(updateTaskStatus({ id: statusTarget.id, status })).unwrap();
      setStatusTarget(null);
    } catch (err) {
      // error captured in redux state
    } finally {
      setStatusSubmitting(false);
    }
  };

  const closeDeleteConfirm = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(deleteTask(deleteTarget.id)).unwrap();
      setDeleteTarget(null);
      dispatch(fetchAssigneesForProject(projectId));
    } catch (err) {
      // error captured in redux state
    } finally {
      setDeleting(false);
    }
  };

  // Only SUPER_ADMIN, the org's OWNER, or an org ADMIN can create or
  // delete tasks. Org MEMBER can still edit/update status of existing
  // tasks below.
  const canCreateOrDelete = canCreateOrDeleteTask(project?.organizationId);

  const columns = [
    { key: 'title', header: 'Title' },
    {
      key: 'description',
      header: 'Description',
      render: (row) =>
        row.description
          ? row.description.length > 60
            ? `${row.description.slice(0, 60)}…`
            : row.description
          : '—',
    },
    { key: 'assignedToName', header: 'Assignee', render: (row) => row.assignedToName || 'Unassigned' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={styles.statusBadge} style={{ background: STATUS_COLORS[row.status] || '#94A3B8' }}>
          {row.status?.replace('_', ' ')}
        </span>
      ),
    },
    { key: 'dueDate', header: 'Due', render: (row) => row.dueDate || '—' },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div className={styles.rowActions}>
          <Button variant="white" onClick={() => setStatusTarget(row)} disabled={actionLoadingId === row.id}>
            Status
          </Button>
          <Button variant="white" onClick={() => openEditForm(row)}>
            Edit
          </Button>
          {canCreateOrDelete && (
            <Button variant="danger" onClick={() => setDeleteTarget(row)} disabled={actionLoadingId === row.id}>
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.backRow}>
        <Button variant="white" onClick={() => navigate('/projects')}>
          ← Back to projects
        </Button>
      </div>

      <Card
        title={projectLoading ? 'Loading project…' : project?.name || 'Tasks'}
        subtitle={project ? `Tasks for ${project.name} (${project.organizationName})` : undefined}
        actions={
          canCreateOrDelete && (
            <div className={styles.newTaskWrap}>
              <Button variant="primary" onClick={openCreateForm} disabled={!project}>
                Create Task
              </Button>
            </div>
          )
        }
      >
        {projectError && <p className={styles.projectErrorText}>{projectError}</p>}

        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
            <button onClick={() => dispatch(clearTaskError())} className={styles.errorClose}>
              ×
            </button>
          </div>
        )}

        {/* Search + assignee filter */}
        <div className={styles.topControls}>
          <div className={styles.searchWrap}>
            <SearchField
              initialValue={searchTerm}
              onSearch={handleSearch}
              placeholder="Search task title..."
            />
          </div>

          <label className={styles.assigneeField}>
            <span className={styles.assigneeLabel}>Assignee</span>
            <select
              value={assignedToId || ''}
              onChange={handleAssigneeChange}
              className={styles.assigneeSelect}
            >
              <option value="">All</option>
              {assignees.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName || user.email}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Table
          columns={columns}
          data={tasks}
          keyField="id"
          emptyMessage={tasksLoading ? 'Loading tasks...' : 'No tasks yet. Create the first one.'}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={size}
          onPageChange={handlePageChange}
          disabled={tasksLoading}
        />
      </Card>

      <TaskFormModal
        open={formOpen}
        projectId={Number(projectId)}
        task={editingTask}
        members={members}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        submitting={submitting}
        error={error}
      />

      <TaskStatusModal
        open={Boolean(statusTarget)}
        task={statusTarget}
        onClose={closeStatusModal}
        onSubmit={handleStatusSubmit}
        submitting={statusSubmitting}
        error={error}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete task"
        message={deleteTarget ? `Delete "${deleteTarget.title}"? This can't be undone.` : ''}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={closeDeleteConfirm}
      />
    </div>
  );
}