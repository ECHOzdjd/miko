import { create } from 'zustand';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

// 从localStorage加载初始状态
const loadState = (): Partial<AuthState> => {
  try {
    const serializedState = localStorage.getItem('auth-storage');
    if (serializedState === null) {
      return {};
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {};
  }
};

// 保存状态到localStorage
const saveState = (state: AuthState) => {
  try {
    const serializedState = JSON.stringify({
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
    });
    localStorage.setItem('auth-storage', serializedState);
  } catch {
    // ignore write errors
  }
};

const initialState = loadState();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialState.user || null,
  token: initialState.token || null,
  isAuthenticated: initialState.isAuthenticated || false,
  isLoading: false,
  
  login: (user: User, token: string) => {
    const newState = {
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    };
    set(newState);
    saveState(get());
  },
  
  logout: () => {
    const newState = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    };
    set(newState);
    saveState(get());
  },
  
  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...userData },
      });
      saveState(get());
    }
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
