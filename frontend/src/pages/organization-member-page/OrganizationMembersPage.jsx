import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/card/Card';
import Table from '../../components/table/Table';
import Button from '../../components/button/Button';
import AddMemberModal from '../../components/add-member-model/AddMemberModal';
import { fetchOrganizations } from '../../redux/slices/organizationSlice';
import { fetchMembers, removeMember, clearMembers } from '../../redux/slices/Memberslice';

// Reads whichever shape OrganizationMemberResponse actually uses. Adjust
// these two lines if your DTO's field names differ (e.g. userName vs
// user.name).
function getMemberName(member) {
  return member.userName || member.user?.name || member.name || '—';
}
function getMemberEmail(member) {
  return member.userEmail || member.user?.email || member.email || '—';
}

export default function OrganizationMembersPage() {
  const dispatch = useDispatch();

  const { items: organizations, loading: orgLoading } = useSelector((state) => state.organizations);
  const { list: members, status: memberStatus, removingId } = useSelector((state) => state.members);

  // "Which org is selected" is UI-only state - it doesn't need to live in
  // Redux, so it's local to this component.
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  useEffect(() => {
    if (selectedOrganizationId) {
      dispatch(fetchMembers(selectedOrganizationId));
    } else {
      dispatch(clearMembers());
    }
  }, [dispatch, selectedOrganizationId]);

  const handleOrgChange = (event) => {
    const value = event.target.value;
    setSelectedOrganizationId(value ? Number(value) : null);
  };

  const handleRemove = (member) => {
    dispatch(removeMember(member.id));
  };

  const columns = [
    { key: 'name', header: 'Name', render: getMemberName },
    { key: 'email', header: 'Email', render: getMemberEmail },
    { key: 'role', header: 'Role', render: (m) => m.role },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (m) => (
        <Button
          variant="danger"
          onClick={() => handleRemove(m)}
          disabled={removingId === m.id}
        >
          {removingId === m.id ? 'Removing...' : 'Remove'}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <Card title="Organization members" subtitle="Select an organization to view and manage its users.">
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

          <Button
            variant="primary"
            disabled={!selectedOrganizationId}
            onClick={() => setShowAddModal(true)}
          >
            + Add user
          </Button>
        </div>
      </Card>

      <Card>
        {!selectedOrganizationId ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '1rem 0' }}>
            Select an organization above to see its members.
          </p>
        ) : (
          <Table
            columns={columns}
            data={members}
            keyField="id"
            emptyMessage={memberStatus === 'loading' ? 'Loading members...' : 'No members yet.'}
          />
        )}
      </Card>

      {showAddModal && selectedOrganizationId && (
        <AddMemberModal
          organizationId={selectedOrganizationId}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}