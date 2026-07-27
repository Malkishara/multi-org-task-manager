// Profile slice for the currently authenticated user's own profile
// (view + edit firstName/lastName). Separate from authSlice, which holds
// login/session state.

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userApi } from "../../apis/userApi";

const extractError = (err, fallback) =>
    err?.response?.data?.message || fallback;

export const fetchProfile = createAsyncThunk(
    "profile/fetch",
    async (_, { rejectWithValue }) => {
        try {
            return await userApi.getProfile();
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to load profile."));
        }
    }
);

export const updateProfile = createAsyncThunk(
    "profile/update",
    async (payload, { rejectWithValue }) => {
        try {
            return await userApi.updateProfile(payload);
        } catch (err) {
            return rejectWithValue(extractError(err, "Failed to update profile."));
        }
    }
);

const initialState = {
    data: null,
    loading: false,
    error: null,
    updateStatus: "idle", // idle | loading | succeeded | failed
    updateError: null,
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        clearProfileError: (state) => {
            state.error = null;
        },
        clearProfileUpdateError: (state) => {
            state.updateError = null;
            state.updateStatus = "idle";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateProfile.pending, (state) => {
                state.updateStatus = "loading";
                state.updateError = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.updateStatus = "succeeded";
                state.data = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.updateStatus = "failed";
                state.updateError = action.payload;
            });
    },
});

export const { clearProfileError, clearProfileUpdateError } = profileSlice.actions;
export default profileSlice.reducer;
