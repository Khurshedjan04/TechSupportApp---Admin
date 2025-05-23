import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  loading: false,
  error: null,
  totalUsers: 0,
  selectedUser: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Set error
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set all users
    setUsers: (state, action) => {
      state.users = action.payload;
      state.totalUsers = action.payload.length;
      state.loading = false;
      state.error = null;
    },
    
    // Add new user
    addUser: (state, action) => {
      state.users.unshift(action.payload);
      state.totalUsers += 1;
    },
    
    // Update user
    updateUser: (state, action) => {
      const index = state.users.findIndex(user => user._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      }
    },
    
    // Delete user
    deleteUser: (state, action) => {
      state.users = state.users.filter(user => user._id !== action.payload);
      state.totalUsers -= 1;
    },
    
    // Set selected user
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    
    // Clear selected user
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    
    // Filter users by role
    filterUsersByRole: (state, action) => {
      const role = action.payload;
      if (role === 'all') {
        // Reset to all users - you might want to store original users separately
        return;
      }
      state.users = state.users.filter(user => user.role === role);
    },
    
    // Search users
    searchUsers: (state, action) => {
      const searchTerm = action.payload.toLowerCase();
      state.users = state.users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      );
    },
    
    // Reset users filter
    resetUsersFilter: (state, action) => {
      state.users = action.payload; // Pass original users array
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setUsers,
  addUser,
  updateUser,
  deleteUser,
  setSelectedUser,
  clearSelectedUser,
  filterUsersByRole,
  searchUsers,
  resetUsersFilter,
} = usersSlice.actions;

export default usersSlice.reducer;