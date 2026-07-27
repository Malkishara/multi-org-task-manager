// Project slice for managing project state (list, create, update, status, delete)

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { projectApi } from "../../apis/projectApi";

const extractError = (err, fallback) =>
    err?.response?.data?.message || fallback;

// organizationId is optional - omit it to fetch every project across every org.
export const fetchProjects = createAsyncThunk(
    "projects/fetchAll",
    async (organizationId, { rejectWithValue }) => {
        try {
            return await projectApi.getProjects(organizationId);
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
                state.items = action.payload;
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
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.actionLoadingId = null;
                state.error = action.payload;
            });
    },
});

export const { clearProjectError, clearProjects } = projectSlice.actions;
export default projectSlice.reducer;
