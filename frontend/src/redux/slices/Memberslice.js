import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { memberApi } from '../../apis/Membersapi';


export const fetchMembers = createAsyncThunk(
    'members/fetchMembers',
    async (
        { organizationId, search, page = 0, size = 10 },
        { rejectWithValue }
    ) => {

        try {

            return await memberApi.getMembers({
                organizationId,
                search,
                page,
                size
            });

        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to load members"
            );

        }

    }
);



export const addMember = createAsyncThunk(
    'members/addMember',

    async (
        { organizationId, email, role },
        { rejectWithValue }
    ) => {

        try {

            return await memberApi.createMember({
                organizationId,
                email,
                role
            });

        } catch(error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to add member"
            );

        }

    }
);



export const removeMember = createAsyncThunk(
    'members/removeMember',

    async (
        memberId,
        { rejectWithValue }
    ) => {

        try {

            await memberApi.deleteMember(memberId);

            return memberId;

        } catch(error) {

            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to remove member"
            );

        }

    }
);



const initialState = {

    list: [],

    status: "idle",

    error: null,


    // search + pagination
    searchTerm: "",

    page: 0,

    size: 10,

    totalPages: 0,

    totalElements: 0,


    // add member
    addStatus: "idle",

    addError: null,


    // remove member
    removingId: null

};



const memberSlice = createSlice({

    name: "members",

    initialState,


    reducers: {


        clearMembers(state) {

            state.list = [];

            state.status = "idle";

            state.error = null;

            state.page = 0;

            state.totalPages = 0;

            state.totalElements = 0;

        },


        clearAddError(state) {

            state.addError = null;

            state.addStatus = "idle";

        },


        setMemberSearchTerm(state, action) {

            state.searchTerm = action.payload;

            state.page = 0;

        }

    },


    extraReducers:(builder)=>{


        builder



        // ============================
        // FETCH MEMBERS
        // ============================

        .addCase(fetchMembers.pending,(state)=>{

            state.status="loading";

            state.error=null;

        })


        .addCase(fetchMembers.fulfilled,(state,action)=>{


            state.status="succeeded";


            /*
              Spring Page response:

              {
                content:[],
                number:0,
                size:10,
                totalPages:5,
                totalElements:50
              }

            */


            state.list = action.payload.content || [];


            state.page = action.payload.number || 0;


            state.size = action.payload.size || 10;


            state.totalPages =
                action.payload.totalPages || 0;


            state.totalElements =
                action.payload.totalElements || 0;


        })


        .addCase(fetchMembers.rejected,(state,action)=>{


            state.status="failed";


            state.error = action.payload;


        })



        // ============================
        // ADD MEMBER
        // ============================


        .addCase(addMember.pending,(state)=>{


            state.addStatus="loading";

            state.addError=null;


        })


        .addCase(addMember.fulfilled,(state,action)=>{


            state.addStatus="succeeded";


            /*
              Do not push directly if using pagination.
              Refetch after adding member is better.

              Keeping this for immediate UI update.
            */


            state.list.unshift(action.payload);


        })


        .addCase(addMember.rejected,(state,action)=>{


            state.addStatus="failed";

            state.addError = action.payload;


        })




        // ============================
        // REMOVE MEMBER
        // ============================


        .addCase(removeMember.pending,(state,action)=>{


            state.removingId = action.meta.arg;


        })


        .addCase(removeMember.fulfilled,(state,action)=>{


            state.removingId=null;


            state.list =
                state.list.filter(
                    member =>
                    member.id !== action.payload
                );


            state.totalElements =
                Math.max(
                    0,
                    state.totalElements - 1
                );


        })


        .addCase(removeMember.rejected,(state)=>{


            state.removingId=null;


        });


    }


});



export const {
    clearMembers,
    clearAddError,
    setMemberSearchTerm

} = memberSlice.actions;



export default memberSlice.reducer;