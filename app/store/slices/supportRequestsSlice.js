import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  supportRequests: [],
  loading: false,
  error: null,
  totalRequests: 0,
  selectedRequest: null,
  filters: {
    status: 'all',
    urgency: 'all',
    userType: 'all',
  },
  stats: {
    pending: 0,
    scheduled: 0,
    resolved: 0,
  },
};

const supportRequestsSlice = createSlice({
  name: 'supportRequests',
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
    
    // Set all support requests
    setSupportRequests: (state, action) => {
      state.supportRequests = action.payload;
      state.totalRequests = action.payload.length;
      state.loading = false;
      state.error = null;
      
      // Calculate stats
      state.stats.pending = action.payload.filter(req => req.status === 'pending').length;
      state.stats.scheduled = action.payload.filter(req => req.status === 'scheduled').length;
      state.stats.resolved = action.payload.filter(req => req.status === 'resolved').length;
    },
    
    // Add new support request
    addSupportRequest: (state, action) => {
      state.supportRequests.unshift(action.payload);
      state.totalRequests += 1;
      
      // Update stats
      if (action.payload.status === 'pending') state.stats.pending += 1;
    },
    
    // Update support request
    updateSupportRequest: (state, action) => {
      const index = state.supportRequests.findIndex(req => req._id === action.payload._id);
      if (index !== -1) {
        const oldStatus = state.supportRequests[index].status;
        const newStatus = action.payload.status;
        
        state.supportRequests[index] = { ...state.supportRequests[index], ...action.payload };
        
        // Update stats if status changed
        if (oldStatus !== newStatus) {
          state.stats[oldStatus] -= 1;
          state.stats[newStatus] += 1;
        }
      }
    },
    
    // Delete support request
    deleteSupportRequest: (state, action) => {
      const requestToDelete = state.supportRequests.find(req => req._id === action.payload);
      if (requestToDelete) {
        state.stats[requestToDelete.status] -= 1;
      }
      
      state.supportRequests = state.supportRequests.filter(req => req._id !== action.payload);
      state.totalRequests -= 1;
    },
    
    // Set selected request
    setSelectedRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },
    
    // Clear selected request
    clearSelectedRequest: (state) => {
      state.selectedRequest = null;
    },
    
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        urgency: 'all',
        userType: 'all',
      };
    },
    
    // Update request status (commonly used)
    updateRequestStatus: (state, action) => {
      const { requestId, status, scheduledDate, notes } = action.payload;
      const index = state.supportRequests.findIndex(req => req._id === requestId);
      
      if (index !== -1) {
        const oldStatus = state.supportRequests[index].status;
        
        state.supportRequests[index].status = status;
        if (scheduledDate) state.supportRequests[index].scheduledDate = scheduledDate;
        if (notes !== undefined) state.supportRequests[index].notes = notes;
        
        // Update stats
        state.stats[oldStatus] -= 1;
        state.stats[status] += 1;
      }
    },
    
    // Bulk update requests
    bulkUpdateRequests: (state, action) => {
      const { requestIds, updates } = action.payload;
      
      requestIds.forEach(id => {
        const index = state.supportRequests.findIndex(req => req._id === id);
        if (index !== -1) {
          const oldStatus = state.supportRequests[index].status;
          state.supportRequests[index] = { ...state.supportRequests[index], ...updates };
          
          // Update stats if status changed
          if (updates.status && oldStatus !== updates.status) {
            state.stats[oldStatus] -= 1;
            state.stats[updates.status] += 1;
          }
        }
      });
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setSupportRequests,
  addSupportRequest,
  updateSupportRequest,
  deleteSupportRequest,
  setSelectedRequest,
  clearSelectedRequest,
  setFilters,
  clearFilters,
  updateRequestStatus,
  bulkUpdateRequests,
} = supportRequestsSlice.actions;

export default supportRequestsSlice.reducer;