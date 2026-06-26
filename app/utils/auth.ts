export const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("driverx_token");
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = async () => {
  localStorage.removeItem("driverx_token");
  localStorage.removeItem("user");
  try {
    const { signOut } = await import('next-auth/react');
    await signOut({ callbackUrl: '/login' });
  } catch (e) {
    window.location.href = '/login';
  }
};
