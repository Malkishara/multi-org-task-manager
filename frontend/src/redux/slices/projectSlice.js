// Project slice for managing project state (list, create, update, status, delete)

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { projectApi } from "../../apis/projectApi";

const extractError = (err, fallback) =>
    err?.response?.data?.message || fallback;

// { organizationId, search, page, size } - organizationId optional (super admin "all orgs")
export const fetchProjects = createAsyncThunk(
    "projects/fetchAll",
    async ({ organizationId, search, page = 0, size = 10 } = {}, { rejectWithValue }) => {
        try {
            return await projectApi.getProjects({ organizationId, search, page, size });
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to load projects."));
        }
    }
);

export const createProject = createAsyncThunk(
    "projects/create",
    async (payload, { rejectWithValue }) => {
        try {
            return await projectApi.createProject(payload);
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to create project."));
        }
    }
);

export const updateProject = createAsyncThunk(
    "projects/update",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            return await projectApi.updateProject(id, payload);
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to update project."));
        }
    }
);

export const updateProjectStatus = createAsyncThunk(
    "projects/updateStatus",
    async ({ id, status, progress }, { rejectWithValue }) => {
        try {
            return await projectApi.updateProjectStatus(id, { status, progress });
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to update status."));
        }
    }
);

export const deleteProject = createAsyncThunk(
    "projects/delete",
    async (id, { rejectWithValue }) => {
        try {
            await projectApi.deleteProject(id);
            return id;
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to delete project."));
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
    // tracks which row's status-update/delete is mid-flight, so only that row's control disables
    actionLoadingId: null,

    // search + pagination
    searchTerm: "",
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
};

const projectSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {
        clearProjectError: (state) => {
            state.error = null;
        },
        clearProjects: (state) => {
            state.items = [];
            state.loading = false;
            state.error = null;
            state.page = 0;
            state.totalPages = 0;
            state.totalElements = 0;
        },
        setProjectSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
            state.page = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetch all
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;

                // Backend returns a Spring Page:
                // { content, number, size, totalPages, totalElements }
                state.items = action.payload.content || [];
                state.page = action.payload.number || 0;
                state.size = action.payload.size || 10;
                state.totalPages = action.payload.totalPages || 0;
                state.totalElements = action.payload.totalElements || 0;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // create
            .addCase(createProject.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(createProject.rejected, (state, action) => {
                state.error = action.payload;
            })

            // update
            .addCase(updateProject.fulfilled, (state, action) => {
                const index = state.items.findIndex((p) => p.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            .addCase(updateProject.rejected, (state, action) => {
                state.error = action.payload;
            })

            // update status
            .addCase(updateProjectStatus.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg.id;
            })
            .addCase(updateProjectStatus.fulfilled, (state, action) => {
                state.actionLoadingId = null;
                const index = state.items.findIndex((p) => p.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            .addCase(updateProjectStatus.rejected, (state, action) => {
                state.actionLoadingId = null;
                state.error = action.payload;
            })

            // delete
            .addCase(deleteProject.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg;
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.actionLoadingId = null;
                state.items = state.items.filter((p) => p.id !== action.payload);
                state.totalElements = Math.max(0, state.totalElements - 1);
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.actionLoadingId = null;
                state.error = action.payload;
            });
    },
});

export const { clearProjectError, clearProjects, setProjectSearchTerm } = projectSlice.actions;
export default projectSlice.reducer;