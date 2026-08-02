// Organization slice for managing organization state (paginated list, search,
// create, update, delete, toggle status)

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { organizationApi } from "../../apis/organizationApi";

const extractError = (err, fallback) =>
    err?.response?.data?.message || fallback;

// arg: { name, page, size } — all optional, thunk fills in slice defaults below
export const fetchOrganizations = createAsyncThunk(
    "organizations/fetchAll",
    async (params, { rejectWithValue }) => {
        try {
            return await organizationApi.getOrganizations(params);
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to load organizations."));
        }
    }
);

export const createOrganization = createAsyncThunk(
    "organizations/create",
    async (payload, { rejectWithValue }) => {
        try {
            return await organizationApi.createOrganization(payload);
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to create organization."));
        }
    }
);

export const updateOrganization = createAsyncThunk(
    "organizations/update",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            return await organizationApi.updateOrganization(id, payload);
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to update organization."));
        }
    }
);

export const toggleOrganizationStatus = createAsyncThunk(
    "organizations/toggleStatus",
    async (organization, { rejectWithValue }) => {
        try {
            return await organizationApi.updateOrganizationStatus(
                organization.id,
                !organization.active
            );
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to update status."));
        }
    }
);

export const deleteOrganization = createAsyncThunk(
    "organizations/delete",
    async (id, { rejectWithValue }) => {
        try {
            await organizationApi.deleteOrganization(id);
            return id;
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to delete organization."));
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
    actionLoadingId: null,

    // pagination + search state
    searchTerm: "",
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
};

const organizationSlice = createSlice({
    name: "organizations",
    initialState,
    reducers: {
        clearOrganizationError: (state) => {
            state.error = null;
        },
        // Kept in sync separately from the fetch call so the search input
        // can reflect the current term immediately, before the debounced
        // fetch resolves.
        setOrganizationSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetch all (paginated)
            .addCase(fetchOrganizations.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                if (action.meta.arg?.name !== undefined) {
                    state.searchTerm = action.meta.arg.name;
                }
            })
            .addCase(fetchOrganizations.fulfilled, (state, action) => {
                state.loading = false;
                const { content, totalElements, totalPages, number, size } = action.payload;
                state.items = content;
                state.totalElements = totalElements;
                state.totalPages = totalPages;
                state.page = number;
                state.size = size;
            })
            .addCase(fetchOrganizations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // create — a full refetch (dispatched from the component) is what
            // actually keeps pagination/totals correct; this just gives
            // immediate feedback if we're on page 0.
            .addCase(createOrganization.fulfilled, (state, action) => {
                if (state.page === 0) {
                    state.items.unshift(action.payload);
                    if (state.items.length > state.size) state.items.pop();
                }
                state.totalElements += 1;
            })
            .addCase(createOrganization.rejected, (state, action) => {
                state.error = action.payload;
            })

            // update
            .addCase(updateOrganization.fulfilled, (state, action) => {
                const index = state.items.findIndex((org) => org.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            .addCase(updateOrganization.rejected, (state, action) => {
                state.error = action.payload;
            })

            // toggle status
            .addCase(toggleOrganizationStatus.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg.id;
            })
            .addCase(toggleOrganizationStatus.fulfilled, (state, action) => {
                state.actionLoadingId = null;
                const index = state.items.findIndex((org) => org.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            .addCase(toggleOrganizationStatus.rejected, (state, action) => {
                state.actionLoadingId = null;
                state.error = action.payload;
            })

            // delete
            .addCase(deleteOrganization.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg;
            })
            .addCase(deleteOrganization.fulfilled, (state, action) => {
                state.actionLoadingId = null;
                state.items = state.items.filter((org) => org.id !== action.payload);
                state.totalElements = Math.max(0, state.totalElements - 1);
            })
            .addCase(deleteOrganization.rejected, (state, action) => {
                state.actionLoadingId = null;
                state.error = action.payload;
            });
    },
});

export const { clearOrganizationError, setOrganizationSearchTerm } = organizationSlice.actions;
export default organizationSlice.reducer;