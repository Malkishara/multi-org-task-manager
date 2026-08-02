import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/card/Card';
import Table from '../../components/table/Table';
import Button from '../../components/button/Button';
import SearchField from '../../components/search-field/SearchField';
import Pagination from '../../components/pagination/Pagination';
import ConfirmModal from '../../components/confirm-modal/ConfirmModal';
import ProjectFormModal from '../../components/project-form-model/ProjectFormModal';
import ProjectStatusModal from '../../components/project-status-model/ProjectStatusModal';
import { fetchOrganizations } from '../../redux/slices/organizationSlice';
import {
  fetchProjects,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  clearProjectError,
  clearProjects,
  setProjectSearchTerm,
} from '../../redux/slices/projectSlice';
import { canCreateOrDeleteProject, canEditProjectOrStatus } from '../../utils/permissions';
import styles from './Project.module.scss';

const STATUS_COLORS = {
  NOT_STARTED: '#94A3B8',
  IN_PROGRESS: '#3B82F6',
  ON_HOLD: '#F59E0B',
  COMPLETED: '#22C55E',
  CANCELLED: '#EF4444',
};

export default function ProjectsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: organizations, loading: orgLoading } = useSelector((state) => state.organizations);
  const {
    items: projects,
    loading: projectsLoading,
    error,
    actionLoadingId,
    searchTerm,
    page,
    size,
    totalPages,
    totalElements,
  } = useSelector((state) => state.projects);

  // null = no organization selected yet. UI-only, kept local like
  // OrganizationMembersPage. Projects are scoped to a single organization,
  // so we don't call the API (or show a stale/empty "all" list) until the
  // user has actually picked one.
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [statusTarget, setStatusTarget] = useState(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedOrganizationId) return;

    dispatch(
      fetchProjects({ organizationId: selectedOrganizationId, search: searchTerm, page, size })
    );
  }, [dispatch, selectedOrganizationId, page]);

  const handleOrgChange = (event) => {
    const value = event.target.value;
    const id = value ? Number(value) : null;
    setSelectedOrganizationId(id);

    if (!id) return;

    // Reset to first page whenever the org filter changes, otherwise
    // we could request a page that's out of range for the new org.
    dispatch(fetchProjects({ organizationId: id, search: searchTerm, page: 0, size }));
  };

  const handleSearch = (value) => {
    dispatch(setProjectSearchTerm(value));

    if (!selectedOrganizationId) return;

    dispatch(fetchProjects({ organizationId: selectedOrganizationId, search: value, page: 0, size }));
  };

  const handlePageChange = (nextPage) => {
    if (!selectedOrganizationId) return;

    dispatch(fetchProjects({ organizationId: selectedOrganizationId, search: searchTerm, page: nextPage, size }));
  };

  const openCreateForm = () => {
    setEditingProject(null);
    setFormOpen(true);
  };

  const openEditForm = (project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setEditingProject(null);
  };

  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editingProject) {
        await dispatch(updateProject({ id: editingProject.id, payload })).unwrap();
      } else {
        await dispatch(createProject(payload)).unwrap();
      }
      setFormOpen(false);
      setEditingProject(null);
    } catch (err) {
      // error is already captured in redux state and rendered below
    } finally {
      setSubmitting(false);
    }
  };

  const closeStatusModal = () => {
    if (statusSubmitting) return;
    setStatusTarget(null);
  };

  const handleStatusSubmit = async ({ status, progress }) => {
    setStatusSubmitting(true);
    try {
      await dispatch(updateProjectStatus({ id: statusTarget.id, status, progress })).unwrap();
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
      await dispatch(deleteProject(deleteTarget.id)).unwrap();
      setDeleteTarget(null);
    } catch (err) {
      // error captured in redux state
    } finally {
      setDeleting(false);
    }
  };

  const goToTasks = (project) => {
    navigate(`/projects/${project.id}/tasks`);
  };

  // Both scoped to the currently selected organization, computed once per
  // render rather than per-row since every row belongs to the same org here.
  const canCreateOrDelete = canCreateOrDeleteProject(selectedOrganizationId);
  const canEditOrStatus = canEditProjectOrStatus(selectedOrganizationId);

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <button onClick={() => goToTasks(row)} className={styles.nameLink}>
          {row.name}
        </button>
      ),
    },
    { key: 'description', header: 'Description', render: (row) => row.description || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={styles.statusBadge}
          style={{ background: STATUS_COLORS[row.status] || '#94A3B8' }}
        >
          {row.status?.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (row) => (
        <div className={styles.progressCell}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${row.progress ?? 0}%` }} />
          </div>
          <span className={styles.progressLabel}>{row.progress ?? 0}%</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div className={styles.rowActions}>
          {canEditOrStatus && (
            <Button variant="white" onClick={() => setStatusTarget(row)} disabled={actionLoadingId === row.id}>
              Status
            </Button>
          )}
          {canEditOrStatus && (
            <Button variant="white" onClick={() => openEditForm(row)}>
              Edit
            </Button>
          )}
          {canCreateOrDelete && (
            <Button
              variant="danger"
              onClick={() => setDeleteTarget(row)}
              disabled={actionLoadingId === row.id}
            >
              Delete
            </Button>
          )}
          {!canEditOrStatus && !canCreateOrDelete && (
            <span className={styles.readOnlyText}>View only</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <Card title="Projects" subtitle="Select an organization to view and manage its projects.">
        <div className={styles.topControls}>
          <label className={styles.orgField}>
            <span className={styles.orgLabel}>Organization</span>
            <select
              value={selectedOrganizationId || ''}
              onChange={handleOrgChange}
              disabled={orgLoading}
              className={styles.orgSelect}
            >
              <option value="" disabled>
                {orgLoading ? 'Loading organizations...' : 'Select an organization'}
              </option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.searchWrap}>
            <SearchField
              initialValue={searchTerm}
              onSearch={handleSearch}
              placeholder="Search project name..."
              disabled={!selectedOrganizationId}
            />
          </div>

          {/* Creating a project is restricted the same way deleting is -
              only the organization's OWNER (or SUPER_ADMIN). */}
          <div className={styles.newProjectWrap}>
            <Button
              variant="primary"
              disabled={!selectedOrganizationId || !canCreateOrDelete}
              onClick={openCreateForm}
            >
              Create Project
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
            <button onClick={() => dispatch(clearProjectError())} className={styles.errorClose}>
              ×
            </button>
          </div>
        )}

        {!selectedOrganizationId ? (
          <p className={styles.loadingText}>Select an organization to view its projects.</p>
        ) : (
          <>
            <Table
              columns={columns}
              data={projects}
              keyField="id"
              emptyMessage={projectsLoading ? 'Loading projects...' : 'No projects yet.'}
            />

            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={size}
              onPageChange={handlePageChange}
              disabled={projectsLoading}
            />
          </>
        )}
      </Card>

      <ProjectFormModal
        open={formOpen}
        organizationId={selectedOrganizationId}
        project={editingProject}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        submitting={submitting}
        error={error}
      />

      <ProjectStatusModal
        open={Boolean(statusTarget)}
        project={statusTarget}
        onClose={closeStatusModal}
        onSubmit={handleStatusSubmit}
        submitting={statusSubmitting}
        error={error}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete project"
        message={deleteTarget ? `Delete "${deleteTarget.name}"? This can't be undone.` : ''}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={closeDeleteConfirm}
      />
    </div>
  );
}