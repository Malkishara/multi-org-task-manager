import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../../components/navbar/Navbar";
import Card from "../../components/card/Card";
import Button from "../../components/button/Button";
import Table from "../../components/table/Table";
import Toggle from "../../components/toggle/Toggle";
import OrganizationFormModal from "../../components/organization-form-modal/OrganizationFormModal";
import ConfirmModal from "../../components/confirm-modal/ConfirmModal";
import { logout as logoutAction } from "../../redux/slices/authSlice";
import {
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    toggleOrganizationStatus,
    clearOrganizationError,
} from "../../redux/slices/organizationSlice";


export default function Organization() {

    const user = useSelector(
        state => state.auth.user
    );

    const {
        items: organizations = [],
        loading = false,
        error = null,
        actionLoadingId = null,
    } = useSelector((state) => state.organizations) || {};

    const dispatch = useDispatch();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null); // org pending delete confirmation
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        dispatch(fetchOrganizations());
    }, [dispatch]);

    const handleLogout = () => {
        dispatch(logoutAction());
    };

    const openCreateModal = () => {
        setEditingOrg(null);
        setModalOpen(true);
    };

    const openEditModal = (org) => {
        setEditingOrg(org);
        setModalOpen(true);
    };

    const closeModal = () => {
        if (submitting) return;
        setModalOpen(false);
        setEditingOrg(null);
    };

    const handleSubmit = async (form) => {
        setSubmitting(true);
        try {
            if (editingOrg) {
                await dispatch(
                    updateOrganization({
                        id: editingOrg.id,
                        payload: { ...form, active: editingOrg.active },
                    })
                ).unwrap();
            } else {
                await dispatch(createOrganization(form)).unwrap();
            }
            setModalOpen(false);
            setEditingOrg(null);
        } catch (err) {
            // error message is already captured in redux state and rendered below
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (org) => {
        setConfirmTarget(org);
    };

    const closeConfirmModal = () => {
        if (deleting) return;
        setConfirmTarget(null);
    };

    const confirmDelete = async () => {
        if (!confirmTarget) return;
        setDeleting(true);
        try {
            await dispatch(deleteOrganization(confirmTarget.id)).unwrap();
            setConfirmTarget(null);
        } catch (err) {
            // error message is already captured in redux state and rendered above the table
        } finally {
            setDeleting(false);
        }
    };

    const handleToggleStatus = (org) => {
        dispatch(toggleOrganizationStatus(org));
    };

    const columns = [
        { key: "name", header: "Name" },
        { key: "description", header: "Description", render: (row) => row.description || "—" },
        { key: "ownerName", header: "Owner" },
        {
            key: "active",
            header: "Status",
            render: (row) => (
                <Toggle
                    checked={row.active}
                    disabled={actionLoadingId === row.id}
                    onChange={() => handleToggleStatus(row)}
                />
            ),
        },
        {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (row) => (
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <Button variant="white" onClick={() => openEditModal(row)}>
                        Edit
                    </Button>
                    <Button
                        variant="danger"
                        disabled={actionLoadingId === row.id}
                        onClick={() => handleDelete(row)}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <Navbar
                user={user}
                onLogout={handleLogout}
            />

            <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <Card
                    title="Organizations"
                    subtitle="Manage the organizations you own."
                    actions={
                        <Button variant="primary" onClick={openCreateModal}>
                            + New organization
                        </Button>
                    }
                >
                    {error && (
                        <div
                            style={{
                                background: "#FEF2F2",
                                border: "1px solid var(--danger)",
                                color: "var(--danger)",
                                borderRadius: "0.75rem",
                                padding: "0.75rem 1rem",
                                marginBottom: "1rem",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <span>{error}</span>
                            <button
                                onClick={() => dispatch(clearOrganizationError())}
                                style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontWeight: 700, fontSize: "1rem" }}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <p style={{ color: "var(--muted)" }}>Loading organizations…</p>
                    ) : (
                        <Table
                            columns={columns}
                            data={organizations}
                            emptyMessage="No organizations yet. Create your first one."
                        />
                    )}
                </Card>
            </div>

            <OrganizationFormModal
                open={modalOpen}
                organization={editingOrg}
                onClose={closeModal}
                onSubmit={handleSubmit}
                submitting={submitting}
            />

            <ConfirmModal
                open={!!confirmTarget}
                title="Delete organization"
                message={
                    confirmTarget
                        ? `Delete "${confirmTarget.name}"? This can't be undone.`
                        : ""
                }
                confirmLabel="Delete"
                confirmVariant="danger"
                loading={deleting}
                onConfirm={confirmDelete}
                onClose={closeConfirmModal}
            />
        </>
    );
}