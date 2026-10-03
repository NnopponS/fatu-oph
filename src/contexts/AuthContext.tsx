import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "firebase/auth";
import {
  type AuthUserProfile,
  type ParticipantRegistrationData,
  type StaffRegistrationData,
  fetchCurrentUserProfile,
  participantRegister,
  signOutUser,
  staffRegister,
  subscribeToAuthState,
  usernameLogin,
} from "@/services/auth";

interface AuthContextType {
  firebaseUser: User | null;
  profile: AuthUserProfile | null;
  role: string;
  loading: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  isPendingStaff: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: ParticipantRegistrationData) => Promise<void>;
  registerStaff: (data: StaffRegistrationData) => Promise<{ message?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await fetchCurrentUserProfile();
      setProfile(data);
    } catch (err) {
      console.error("Failed to load user profile:", err);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      setFirebaseUser(user);
      if (user) {
        await refreshProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [refreshProfile]);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const { user, profile: authProfile } = await usernameLogin(username, password);
      setFirebaseUser(user);
      setProfile(authProfile);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: ParticipantRegistrationData) => {
    setLoading(true);
    try {
      const { user, profile: authProfile } = await participantRegister(data);
      setFirebaseUser(user);
      setProfile(authProfile);
    } finally {
      setLoading(false);
    }
  };

  const registerStaff = async (data: StaffRegistrationData) => {
    setLoading(true);
    try {
      const res = await staffRegister(data);
      setFirebaseUser(res.user);
      setProfile(res.profile);
      return { message: res.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOutUser();
      setFirebaseUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const role = profile?.role || "viewer";
  const isAdmin = role === "admin";
  const isStaff = role === "staff" || role === "editor" || role === "admin";
  const isPendingStaff = role === "staff_pending";

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        role,
        loading,
        isAdmin,
        isStaff,
        isPendingStaff,
        login,
        register,
        registerStaff,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
