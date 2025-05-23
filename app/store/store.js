import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import usersSlice from './slices/usersSlice';
import supportRequestsSlice from './slices/supportRequestsSlice';
import quoteRequestsSlice from './slices/quoteRequestsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: usersSlice,
    supportRequests: supportRequestsSlice,
    quoteRequests: quoteRequestsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;