import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Card from "../../components/card/Card";
import Table from "../../components/table/Table";
import Button from "../../components/button/Button";
import SearchField from "../../components/search-field/SearchField";
import Pagination from "../../components/pagination/Pagination";

import AddMemberModal from "../../components/add-member-model/AddMemberModal";

import { fetchOrganizations } from "../../redux/slices/organizationSlice";

import {
    fetchMembers,
    removeMember,
    setMemberSearchTerm
} from "../../redux/slices/Memberslice";

import { canManageMembers } from "../../utils/permissions";

import styles from "./OrganizationMembersPage.module.scss";


function getMemberName(member) {
    return (
        member.userFullName ||
        member.userName ||
        member.user?.name ||
        `${member.user?.firstName || ""} ${member.user?.lastName || ""}`.trim() ||
        "—"
    );
}


function getMemberEmail(member) {
    return (
        member.userEmail ||
        member.user?.email ||
        member.email ||
        "—"
    );
}


export default function OrganizationMembersPage() {


    const dispatch = useDispatch();


    const {
        items: organizations = [],
        loading: orgLoading = false
    } = useSelector(
        state => state.organizations
    );


    const {
        list = [],
        status,
        searchTerm = "",
        page = 0,
        size = 10,
        totalPages = 0,
        totalElements = 0,
        removingId
    } = useSelector(
        state => state.members
    );


    const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);

    const [showAddModal, setShowAddModal] = useState(false);



    useEffect(() => {

        dispatch(fetchOrganizations());

    }, [dispatch]);



    useEffect(() => {

        // Members are scoped to a single organization - don't call the API
        // (and don't show a stale/empty "All organizations" list) until the
        // user has actually picked one.
        if (!selectedOrganizationId) return;

        dispatch(
            fetchMembers({
                organizationId: selectedOrganizationId,
                search: searchTerm,
                page,
                size
            })
        );

    }, [
        dispatch,
        selectedOrganizationId,
        page
    ]);



    const handleOrganizationChange = (e) => {

        const id = e.target.value ? Number(e.target.value) : null;

        setSelectedOrganizationId(id);

        if (!id) return;

        // Reset to first page whenever the org filter changes, otherwise
        // we could request a page that's out of range for the new org.
        dispatch(
            fetchMembers({
                organizationId: id,
                search: searchTerm,
                page: 0,
                size
            })
        );

    };



    const handleSearch = (value) => {

        dispatch(
            setMemberSearchTerm(value)
        );

        if (!selectedOrganizationId) return;

        dispatch(
            fetchMembers({
                organizationId: selectedOrganizationId,
                search: value,
                page: 0,
                size
            })
        );

    };



    const handlePageChange = (nextPage) => {

        if (!selectedOrganizationId) return;

        dispatch(
            fetchMembers({
                organizationId: selectedOrganizationId,
                search: searchTerm,
                page: nextPage,
                size
            })
        );

    };



    const handleRemove = (member) => {

        dispatch(removeMember(member.id));

    };



    // Removing members is scoped to the currently selected organization,
    // so this is computed once per render rather than per-row.
    const canRemoveMembers = canManageMembers(selectedOrganizationId);



    const columns = [

        {
            key: "name",
            header: "Name",
            render: getMemberName
        },


        {
            key: "email",
            header: "Email",
            render: getMemberEmail
        },


        {
            key: "role",
            header: "Role",
            render: (m) => m.role || "MEMBER"
        },


        {
            key: "joinedAt",
            header: "Added",
            render: (m) =>
                m.joinedAt
                    ?
                    new Date(m.joinedAt)
                        .toLocaleDateString()
                    :
                    "—"
        },


        {
            key: "actions",
            header: "Actions",
            align: "right",

            render: (m) => (

                canRemoveMembers ? (

                    <Button

                        variant="danger"

                        disabled={
                            removingId === m.id
                        }

                        onClick={() =>
                            handleRemove(m)
                        }

                    >

                        {
                            removingId === m.id
                                ?
                                "Removing..."
                                :
                                "Remove"
                        }


                    </Button>

                ) : (

                    <span className={styles.readOnlyText}>
                        View only
                    </span>

                )
            )
        }

    ];



    return (
        <div className={styles.page}>

            <Card
                title="Organization Members"
                subtitle="Manage members inside your organizations."
            >

                {/* Top Controls */}
                <div className={styles.topControls}>

                    {/* Organization Dropdown */}
                    <label className={styles.orgField}>

                        <span className={styles.orgLabel}>
                            Organization
                        </span>


                        <select
                            value={selectedOrganizationId || ""}
                            onChange={handleOrganizationChange}
                            disabled={orgLoading}
                            className={styles.orgSelect}
                        >

                            <option value="" disabled>
                                {
                                    orgLoading
                                        ? "Loading organizations..."
                                        : "Select an organization"
                                }
                            </option>


                            {
                                organizations.map((org) => (

                                    <option
                                        key={org.id}
                                        value={org.id}
                                    >
                                        {org.name}
                                    </option>

                                ))
                            }


                        </select>


                    </label>



                    {/* Search */}
                    <div className={styles.searchWrap}>

                        <SearchField
                            initialValue={searchTerm}
                            onSearch={handleSearch}
                            placeholder="Search member name..."
                            disabled={!selectedOrganizationId}
                        />

                    </div>



                    {/* Add Member Button - only the org's OWNER (or SUPER_ADMIN)
                        can add members, same rule as removing them. */}
                    <div className={styles.addMemberWrap}>

                        <Button
                            variant="primary"
                            disabled={!selectedOrganizationId || !canRemoveMembers}
                            onClick={() => setShowAddModal(true)}
                        >
                            Add Member
                        </Button>


                    </div>


                </div>



                {/* Table */}
                {
                    !selectedOrganizationId ? (

                        <p className={styles.loadingText}>
                            Select an organization to view its members.
                        </p>

                    ) : status === "loading" ? (

                        <p className={styles.loadingText}>
                            Loading members...
                        </p>

                    ) : (

                        <>

                            <Table
                                columns={columns}
                                data={list}
                                keyField="id"
                                emptyMessage="No members found."
                            />


                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                totalElements={totalElements}
                                pageSize={size}
                                onPageChange={handlePageChange}
                                disabled={status === "loading"}
                            />


                        </>

                    )
                }


            </Card>



            {
                showAddModal && selectedOrganizationId && (

                    <AddMemberModal
                        organizationId={selectedOrganizationId}
                        onClose={() => setShowAddModal(false)}
                    />

                )
            }


        </div>
    );

}