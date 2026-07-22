export const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  try {
    const { signOut } = await import('next-auth/react');
    await signOut({ callbackUrl: '/login' });
  } catch (e) {
    window.location.href = '/login';
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const isAuthenticated = () => {
  return !!getToken();
};


