import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  quoteRequests: [],
  loading: false,
  error: null,
  totalQuotes: 0,
  selectedQuote: null,
  filters: {
    status: 'all',
    budget: 'all',
    timeline: 'all',
  },
  stats: {
    pending: 0,
    reviewed: 0,
    quoted: 0,
    accepted: 0,
    declined: 0,
  },
};

const quoteRequestsSlice = createSlice({
  name: 'quoteRequests',
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
    
    // Set all quote requests
    setQuoteRequests: (state, action) => {
      state.quoteRequests = action.payload;
      state.totalQuotes = action.payload.length;
      state.loading = false;
      state.error = null;
      
      // Calculate stats
      state.stats.pending = action.payload.filter(req => req.status === 'pending').length;
      state.stats.reviewed = action.payload.filter(req => req.status === 'reviewed').length;
      state.stats.quoted = action.payload.filter(req => req.status === 'quoted').length;
      state.stats.accepted = action.payload.filter(req => req.status === 'accepted').length;
      state.stats.declined = action.payload.filter(req => req.status === 'declined').length;
    },
    
    // Add new quote request
    addQuoteRequest: (state, action) => {
      state.quoteRequests.unshift(action.payload);
      state.totalQuotes += 1;
      
      // Update stats
      if (action.payload.status === 'pending') state.stats.pending += 1;
    },
    
    // Update quote request
    updateQuoteRequest: (state, action) => {
      const index = state.quoteRequests.findIndex(req => req._id === action.payload._id);
      if (index !== -1) {
        const oldStatus = state.quoteRequests[index].status;
        const newStatus = action.payload.status;
        
        state.quoteRequests[index] = { ...state.quoteRequests[index], ...action.payload };
        
        // Update stats if status changed
        if (oldStatus !== newStatus) {
          state.stats[oldStatus] -= 1;
          state.stats[newStatus] += 1;
        }
      }
    },
    
    // Delete quote request
    deleteQuoteRequest: (state, action) => {
      const requestToDelete = state.quoteRequests.find(req => req._id === action.payload);
      if (requestToDelete) {
        state.stats[requestToDelete.status] -= 1;
      }
      
      state.quoteRequests = state.quoteRequests.filter(req => req._id !== action.payload);
      state.totalQuotes -= 1;
    },
    
    // Set selected quote
    setSelectedQuote: (state, action) => {
      state.selectedQuote = action.payload;
    },
    
    // Clear selected quote
    clearSelectedQuote: (state) => {
      state.selectedQuote = null;
    },
    
    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        budget: 'all',
        timeline: 'all',
      };
    },
    
    // Update quote status and amount (commonly used)
    updateQuoteStatus: (state, action) => {
      const { quoteId, status, quotedAmount, adminNotes } = action.payload;
      const index = state.quoteRequests.findIndex(req => req._id === quoteId);
      
      if (index !== -1) {
        const oldStatus = state.quoteRequests[index].status;
        
        state.quoteRequests[index].status = status;
        if (quotedAmount !== undefined) state.quoteRequests[index].quotedAmount = quotedAmount;
        if (adminNotes !== undefined) state.quoteRequests[index].adminNotes = adminNotes;
        
        // Update stats
        state.stats[oldStatus] -= 1;
        state.stats[status] += 1;
      }
    },
    
    // Bulk update quotes
    bulkUpdateQuotes: (state, action) => {
      const { quoteIds, updates } = action.payload;
      
      quoteIds.forEach(id => {
        const index = state.quoteRequests.findIndex(req => req._id === id);
        if (index !== -1) {
          const oldStatus = state.quoteRequests[index].status;
          state.quoteRequests[index] = { ...state.quoteRequests[index], ...updates };
          
          // Update stats if status changed
          if (updates.status && oldStatus !== updates.status) {
            state.stats[oldStatus] -= 1;
            state.stats[updates.status] += 1;
          }
        }
      });
    },
    
    // Set quote amount
    setQuoteAmount: (state, action) => {
      const { quoteId, amount } = action.payload;
      const index = state.quoteRequests.findIndex(req => req._id === quoteId);
      
      if (index !== -1) {
        state.quoteRequests[index].quotedAmount = amount;
      }
    },
    
    // Add admin notes
    addAdminNotes: (state, action) => {
      const { quoteId, notes } = action.payload;
      const index = state.quoteRequests.findIndex(req => req._id === quoteId);
      
      if (index !== -1) {
        state.quoteRequests[index].adminNotes = notes;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setQuoteRequests,
  addQuoteRequest,
  updateQuoteRequest,
  deleteQuoteRequest,
  setSelectedQuote,
  clearSelectedQuote,
  setFilters,
  clearFilters,
  updateQuoteStatus,
  bulkUpdateQuotes,
  setQuoteAmount,
  addAdminNotes,
} = quoteRequestsSlice.actions;

export default quoteRequestsSlice.reducer;