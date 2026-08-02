import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Card from "../../components/card/Card";
import Button from "../../components/button/Button";
import Table from "../../components/table/Table";
import Toggle from "../../components/toggle/Toggle";
import Pagination from "../../components/pagination/Pagination";
import SearchField from "../../components/search-field/SearchField";
import OrganizationFormModal from "../../components/organization-form-modal/OrganizationFormModal";
import ConfirmModal from "../../components/confirm-modal/ConfirmModal";
import { logout as logoutAction, setUser } from "../../redux/slices/authSlice";
import {
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    toggleOrganizationStatus,
    clearOrganizationError,
    setOrganizationSearchTerm,
} from "../../redux/slices/organizationSlice";
import { fetchProfile } from "../../redux/slices/profileSlice";
import { canManageOrganization } from "../../utils/permissions";
import styles from "./Organization.module.scss";

export default function Organization() {

    const user = useSelector(
        state => state.auth.user
    );

    // The per-organization role (OWNER/ADMIN/MEMBER) only exists on the
    // profile response, not the auth user - so permission checks read from
    // profile, and we make sure it's loaded here too (Navbar may already
    // have fetched it, but this page shouldn't depend on that).
    const profile = useSelector(
        state => state.profile.data
    );

    const {
        items: organizations = [],
        loading = false,
        error = null,
        actionLoadingId = null,
        searchTerm = "",
        page = 0,
        size = 10,
        totalPages = 0,
        totalElements = 0,
    } = useSelector((state) => state.organizations) || {};

    const dispatch = useDispatch();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!profile) {
            dispatch(fetchProfile());
        }
    }, [dispatch, profile]);

    // Refetch whenever the page changes. Search is handled separately in
    // handleSearch since it needs to force page back to 0.
    useEffect(() => {
        dispatch(fetchOrganizations({ name: searchTerm, page, size }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, page]);

    const handleLogout = () => {
        dispatch(logoutAction());
    };

    const handleSearch = (name) => {
        dispatch(setOrganizationSearchTerm(name));
        dispatch(fetchOrganizations({ name, page: 0, size }));
    };

    const handlePageChange = (nextPage) => {
        dispatch(fetchOrganizations({ name: searchTerm, page: nextPage, size }));
    };

    const refetchCurrentPage = () => {
        dispatch(fetchOrganizations({ name: searchTerm, page, size }));
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
                    payload: {
                        ...form,
                        active: editingOrg.active,
                    },
                })
            ).unwrap();
        } else {
            await dispatch(createOrganization(form)).unwrap();

            // Refresh logged-in user's organizations (they're now OWNER of
            // the new one). permission.js reads straight from localStorage,
            // so also push the refreshed profile into authSlice/localStorage
            // here - otherwise canManageOrganization() would still see the
            // stale role until the next full page load.
            const refreshedProfile = await dispatch(fetchProfile()).unwrap();
            dispatch(setUser(refreshedProfile));

            refetchCurrentPage();
        }

        setModalOpen(false);
        setEditingOrg(null);

    } catch (err) {
        // handled by redux
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
            refetchCurrentPage();
        } catch (err) {
            // error message is already captured in redux state and rendered above
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
                canManageOrganization(row.id) ? (
                    <Toggle
                        checked={row.active}
                        disabled={actionLoadingId === row.id}
                        onChange={() => handleToggleStatus(row)}
                    />
                ) : (
                    <span className={styles.readOnlyStatus}>
                        {row.active ? "Active" : "Inactive"}
                    </span>
                )
            ),
        },
        {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (row) => (
                canManageOrganization(row.id) ? (
                    <div className={styles.tableActions}>
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
                ) : (
                    <span className={styles.readOnlyText}>View only</span>
                )
            ),
        },
    ];

    return (
        <>
            <div className={styles.page}>
                <Card
                    title="Organizations"
                    subtitle="Manage the organizations you own."
                    actions={
                        <div className={styles.actions}>
                            <SearchField
                                initialValue={searchTerm}
                                onSearch={handleSearch}
                                placeholder="Search by name…"
                            />
                            <Button variant="primary" onClick={openCreateModal}>
                                 Create Organization
                            </Button>
                        </div>
                    }
                >
                    {error && (
                        <div className={styles.errorBanner}>
                            <span>{error}</span>
                            <button
                                onClick={() => dispatch(clearOrganizationError())}
                                className={styles.errorClose}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <p className={styles.loadingText}>Loading organizations…</p>
                    ) : (
                        <>
                            <Table
                                columns={columns}
                                data={organizations}
                                emptyMessage="No organizations yet. Create your first one."
                            />
                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                totalElements={totalElements}
                                pageSize={size}
                                onPageChange={handlePageChange}
                                disabled={loading}
                            />
                        </>
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