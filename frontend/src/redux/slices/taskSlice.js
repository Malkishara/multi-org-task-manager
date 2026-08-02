// Task slice for managing task state within a project (paginated list,
// search, assignee filter, create, update, status, delete)

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { taskApi } from "../../apis/taskApi";

const extractError = (err, fallback) =>
    err?.response?.data?.message || fallback;

// arg: { projectId, search, assignedToId, page, size }
export const fetchTasksByProject = createAsyncThunk(
    "tasks/fetchByProject",
    async ({ projectId, search, assignedToId, page = 0, size = 10 }, { rejectWithValue }) => {
        try {
            const data = await taskApi.getTasksByProject(projectId, {
                search: search || undefined,
                assignedToId: assignedToId || undefined,
                page,
                size,
            });
            return data;
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to load tasks."));
        }
    }
);

export const fetchAssigneesForProject = createAsyncThunk(
    "tasks/fetchAssignees",
    async (projectId, { rejectWithValue }) => {
        try {
            return await taskApi.getAssigneesForProject(projectId);
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to load assignees."));
        }
    }
);

export const createTask = createAsyncThunk(
    "tasks/create",
    async (payload, { rejectWithValue }) => {
        try {
            return await taskApi.createTask(payload);
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to create task."));
        }
    }
);

export const updateTask = createAsyncThunk(
    "tasks/update",
    async ({ id, payload }, { rejectWithValue }) => {
        try {
            return await taskApi.updateTask(id, payload);
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to update task."));
        }
    }
);

export const updateTaskStatus = createAsyncThunk(
    "tasks/updateStatus",
    async ({ id, status }, { rejectWithValue }) => {
        try {
            return await taskApi.updateTaskStatus(id, { status });
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to update status."));
        }
    }
);

export const deleteTask = createAsyncThunk(
    "tasks/delete",
    async (id, { rejectWithValue }) => {
        try {
            await taskApi.deleteTask(id);
            return id;
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to delete task."));
        }
    }
);

const initialState = {
    items: [],
    loading: false,
    error: null,
    // tracks which row's status-update/delete is mid-flight
    actionLoadingId: null,

    // pagination + filters
    searchTerm: "",
    assignedToId: null,
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,

    // assignee filter dropdown options
    assignees: [],
    assigneesLoading: false,
};

const taskSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {
        clearTaskError: (state) => {
            state.error = null;
        },
        clearTasks: (state) => {
            state.items = [];
            state.loading = false;
            state.error = null;
            state.searchTerm = "";
            state.assignedToId = null;
            state.page = 0;
            state.totalPages = 0;
            state.totalElements = 0;
            state.assignees = [];
        },
        setTaskSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
        },
        setTaskAssigneeFilter: (state, action) => {
            state.assignedToId = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetch by project (paginated)
            .addCase(fetchTasksByProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTasksByProject.fulfilled, (state, action) => {
                state.loading = false;
                // Spring's Page<T> shape: content, number, size, totalPages, totalElements
                state.items = action.payload.content ?? action.payload;
                state.page = action.payload.number ?? 0;
                state.size = action.payload.size ?? state.size;
                state.totalPages = action.payload.totalPages ?? 0;
                state.totalElements = action.payload.totalElements ?? 0;
            })
            .addCase(fetchTasksByProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // assignees list for filter dropdown
            .addCase(fetchAssigneesForProject.pending, (state) => {
                state.assigneesLoading = true;
            })
            .addCase(fetchAssigneesForProject.fulfilled, (state, action) => {
                state.assigneesLoading = false;
                state.assignees = action.payload;
            })
            .addCase(fetchAssigneesForProject.rejected, (state, action) => {
                state.assigneesLoading = false;
                state.error = action.payload;
            })

            // create
            .addCase(createTask.fulfilled, (state, action) => {
                state.items.unshift(action.payload);
            })
            .addCase(createTask.rejected, (state, action) => {
                state.error = action.payload;
            })

            // update
            .addCase(updateTask.fulfilled, (state, action) => {
                const index = state.items.findIndex((t) => t.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.error = action.payload;
            })

            // update status
            .addCase(updateTaskStatus.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg.id;
            })
            .addCase(updateTaskStatus.fulfilled, (state, action) => {
                state.actionLoadingId = null;
                const index = state.items.findIndex((t) => t.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            .addCase(updateTaskStatus.rejected, (state, action) => {
                state.actionLoadingId = null;
                state.error = action.payload;
            })

            // delete
            .addCase(deleteTask.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg;
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.actionLoadingId = null;
                state.items = state.items.filter((t) => t.id !== action.payload);
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.actionLoadingId = null;
                state.error = action.payload;
            });
    },
});

export const { clearTaskError, clearTasks, setTaskSearchTerm, setTaskAssigneeFilter } = taskSlice.actions;
export default taskSlice.reducer;