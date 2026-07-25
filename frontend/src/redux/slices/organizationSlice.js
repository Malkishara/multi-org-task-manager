// Organization slice for managing organization state (list, create, update, delete, toggle status)

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { organizationApi } from "../../apis/organizationApi";

const extractError = (err, fallback) =>
    err?.response?.data?.message || fallback;

export const fetchOrganizations = createAsyncThunk(
    "organizations/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            return await organizationApi.getOrganizations();
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

// Calls the dedicated status-only endpoint, so toggling doesn't need to
// resend name/description/logoUrl.
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
    // tracks which row's toggle/delete is mid-flight, so only that row's control disables
    actionLoadingId: null,
};

const organizationSlice = createSlice({
    name: "organizations",
    initialState,
    reducers: {
        clearOrganizationError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetch all
            .addCase(fetchOrganizations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrganizations.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchOrganizations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // create
            .addCase(createOrganization.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
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

            // toggle status (optimistic-ish: flips immediately via per-row loading flag)
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
            })
            .addCase(deleteOrganization.rejected, (state, action) => {
                state.actionLoadingId = null;
                state.error = action.payload;
            });
    },
});

export const { clearOrganizationError } = organizationSlice.actions;
export default organizationSlice.reducer;