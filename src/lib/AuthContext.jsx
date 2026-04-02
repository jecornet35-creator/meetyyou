import React, { createContext, useContext, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Fetch public settings first
        await base44.appPublicSettings.getAppPublicSettings();
        setIsLoadingPublicSettings(false);

        // Check authentication
        const currentUser = await base44.auth.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (error.code === 'user_not_registered') {
          setAuthError({ type: 'user_not_registered' });
        } else if (error.code === 'auth_required') {
          setAuthError({ type: 'auth_required' });
        } else {
          setAuthError({ type: 'unknown', message: error.message });
        }
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initAuth();
  }, []);

  const navigateToLogin = () => {
    base44.auth.login();
  };

  const logout = async () => {
    await base44.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      navigateToLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
