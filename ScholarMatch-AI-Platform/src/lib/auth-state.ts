import { useEffect, useState } from "react";

export type Role = "student" | "reviewer" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
};

type TestAccount = AuthUser & { password: string };

export const testAccounts: TestAccount[] = [
  {
    id: "student-albin",
    name: "Albin Rudro",
    email: "student@scholarmatch.test",
    password: "Student123!",
    role: "student",
    initials: "AR",
  },
  {
    id: "reviewer-maya",
    name: "Maya Chen",
    email: "reviewer@scholarmatch.test",
    password: "Reviewer123!",
    role: "reviewer",
    initials: "MC",
  },
  {
    id: "admin-sam",
    name: "Sam Okafor",
    email: "admin@scholarmatch.test",
    password: "Admin123!",
    role: "admin",
    initials: "SO",
  },
];

const sessionKey = "scholarmatch-session";

function withoutPassword(account: TestAccount): AuthUser {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    initials: account.initials,
  };
}

export function authenticate(email: string, password: string) {
  const account = testAccounts.find(
    (candidate) =>
      candidate.email.toLowerCase() === email.trim().toLowerCase() &&
      candidate.password === password,
  );
  if (!account) return null;

  const user = withoutPassword(account);
  if (typeof window !== "undefined") window.localStorage.setItem(sessionKey, JSON.stringify(user));
  return user;
}

export function getSession(): AuthUser | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(sessionKey);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return null;
    const user = parsed as Partial<AuthUser>;
    return typeof user.id === "string" &&
      typeof user.name === "string" &&
      typeof user.email === "string" &&
      typeof user.initials === "string" &&
      (user.role === "student" || user.role === "reviewer" || user.role === "admin")
      ? (user as AuthUser)
      : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window !== "undefined") window.localStorage.removeItem(sessionKey);
}

export function useSession() {
  const [session, setSession] = useState<AuthUser | null>(getSession);

  useEffect(() => {
    const sync = () => setSession(getSession());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return session;
}

export function roleLabel(role: Role) {
  return role === "admin" ? "Admin" : role === "reviewer" ? "Reviewer" : "Student";
}
