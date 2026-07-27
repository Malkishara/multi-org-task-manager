import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/card/Card';
import Table from '../../components/table/Table';
import Button from '../../components/button/Button';
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
} from '../../redux/slices/projectSlice';

const STATUS_COLORS = {
  NOT_STARTED: '#94A3B8',
  IN_PROGRESS: '#3B82F6',
  ON_HOLD: '#F59E0B',
  COMPLETED: '#22C55E',
  CANCELLED: '#EF4444',
};

export default function ProjectsPage() {
  const dispatch = useDispatch();

  const { items: organizations, loading: orgLoading } = useSelector((state) => state.organizations);
  const {
    items: projects,
    loading: projectsLoading,
    error,
    actionLoadingId,
  } = useSelector((state) => state.projects);

  // "Which org is selected" is UI-only - kept local, same as OrganizationMembersPage.
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
    if (selectedOrganizationId) {
      dispatch(fetchProjects(selectedOrganizationId));
    } else {
      dispatch(clearProjects());
    }
  }, [dispatch, selectedOrganizationId]);

  const handleOrgChange = (event) => {
    const value = event.target.value;
    setSelectedOrganizationId(value ? Number(value) : null);
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

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description', render: (row) => row.description || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          style={{
            display: 'inline-block',
            padding: '0.25rem 0.65rem',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#fff',
            background: STATUS_COLORS[row.status] || '#94A3B8',
          }}
        >
          {row.status?.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '120px' }}>
          <div style={{ flex: 1, background: '#E2E8F0', borderRadius: '999px', height: '8px' }}>
            <div
              style={{
                width: `${row.progress ?? 0}%`,
                background: 'var(--blue)',
                height: '100%',
                borderRadius: '999px',
              }}
            />
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{row.progress ?? 0}%</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button variant="white" onClick={() => setStatusTarget(row)} disabled={actionLoadingId === row.id}>
            Status
          </Button>
          <Button variant="white" onClick={() => openEditForm(row)}>
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => setDeleteTarget(row)}
            disabled={actionLoadingId === row.id}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Card title="Projects" subtitle="Select an organization to view and manage its projects.">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '260px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>Organization</span>
            <select
              value={selectedOrganizationId || ''}
              onChange={handleOrgChange}
              disabled={orgLoading}
              style={{
                padding: '0.8rem 0.95rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--muted)',
                outline: 'none',
                fontSize: '1rem',
              }}
            >
              <option value="">{orgLoading ? 'Loading organizations...' : 'Select an organization'}</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </label>

          <Button variant="primary" disabled={!selectedOrganizationId} onClick={openCreateForm}>
            + New project
          </Button>
        </div>
      </Card>

      <Card>
        {error && (
          <div
            style={{
              background: '#FEF2F2',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearProjectError())}
              style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}
            >
              ×
            </button>
          </div>
        )}

        {!selectedOrganizationId ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '1rem 0' }}>
            Select an organization above to see its projects.
          </p>
        ) : (
          <Table
            columns={columns}
            data={projects}
            keyField="id"
            emptyMessage={projectsLoading ? 'Loading projects...' : 'No projects yet. Create the first one.'}
          />
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
