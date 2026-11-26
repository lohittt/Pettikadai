import { createContext, useContext, useState, useEffect, useCallback, createElement } from 'react';
import { PettikadaiAPI } from '../api/pettikadaiApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        setLoading(true);
        try {
            const res = await PettikadaiAPI.getMe();
            if (res.success && res.user) {
                setUser(res.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const login = useCallback(async (email, password) => {
        const res = await PettikadaiAPI.login(email, password);
        if (res.success && res.user) {
            setUser(res.user);
        }
        return res;
    }, []);

    const register = useCallback(async (name, email, password) => {
        const res = await PettikadaiAPI.register(name, email, password);
        if (res.success && res.user) {
            setUser(res.user);
        }
        return res;
    }, []);

    const logout = useCallback(async () => {
        const res = await PettikadaiAPI.logout();
        setUser(null);
        return res;
    }, []);

    const value = {
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshUser
    };

    return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}
