import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  return session?.user;
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  
  return !!user;
}

export async function hasRole(role: string) {
  const user = await getCurrentUser();
  
  return user?.role === role;
}

export async function isAdmin() {
  return hasRole("ADMIN");
}

export async function isParent() {
  const user = await getCurrentUser();
  
  return user?.role === "ADMIN" || user?.role === "PARENT";
}
