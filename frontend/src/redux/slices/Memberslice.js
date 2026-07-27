import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { memberApi } from '../../apis/Membersapi';

export const fetchMembers = createAsyncThunk(
  'members/fetchMembers',
  async (organizationId, { rejectWithValue }) => {
    try {
      return await memberApi.getMembers(organizationId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load members');
    }
  }
);

export const addMember = createAsyncThunk(
  'members/addMember',
  async ({ organizationId, email, role }, { rejectWithValue }) => {
    try {
      return await memberApi.createMember({ organizationId, email, role });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add member');
    }
  }
);

export const removeMember = createAsyncThunk(
  'members/removeMember',
  async (memberId, { rejectWithValue }) => {
    try {
      return await memberApi.deleteMember(memberId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove member');
    }
  }
);

const initialState = {
  list: [],
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  addStatus: 'idle',
  addError: null,
  removingId: null,
};

const memberSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    clearMembers(state) {
      state.list = [];
      state.status = 'idle';
      state.error = null;
    },
    clearAddError(state) {
      state.addError = null;
      state.addStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addMember.pending, (state) => {
        state.addStatus = 'loading';
        state.addError = null;
      })
      .addCase(addMember.fulfilled, (state, action) => {
        state.addStatus = 'succeeded';
        state.list.push(action.payload);
      })
      .addCase(addMember.rejected, (state, action) => {
        state.addStatus = 'failed';
        state.addError = action.payload;
      })
      .addCase(removeMember.pending, (state, action) => {
        state.removingId = action.meta.arg;
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.removingId = null;
        state.list = state.list.filter((member) => member.id !== action.payload);
      })
      .addCase(removeMember.rejected, (state) => {
        state.removingId = null;
      });
  },
});

export const { clearMembers, clearAddError } = memberSlice.actions;
export default memberSlice.reducer;