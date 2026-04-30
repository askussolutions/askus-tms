import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  sessionId: string | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: sessionStorage.getItem('tms_token'),
    user: (() => {
      try { return JSON.parse(sessionStorage.getItem('tms_user') ?? 'null'); }
      catch { return null; }
    })(),
    sessionId: null,
  } as AuthState,
  reducers: {
    setSessionId(state, action: PayloadAction<string>) {
      state.sessionId = action.payload;
    },
    loginSuccess(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user  = action.payload.user;
      sessionStorage.setItem('tms_token', action.payload.token);
      sessionStorage.setItem('tms_user',  JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.token     = null;
      state.user      = null;
      state.sessionId = null;
      sessionStorage.clear();
    },
  },
});

export const store = configureStore({ reducer: { auth: authSlice.reducer } });

export const { setSessionId, loginSuccess, logout } = authSlice.actions;
export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(sel: (s: RootState) => T) => useSelector(sel);
