import type { AuthUser } from "../interfaces/auth";
import type { RoleValue } from "../interfaces/role";

export const users: AuthUser[] = [
  {
    id: "u-student-001",
    email: "student@gkislms.local",
    password: "student123",
    name: "Student User",
    role: "Student",
  },
  {
    id: "u-teacher-001",
    email: "teacher@gkislms.local",
    password: "teacher123",
    name: "Teacher User",
    role: "Teacher",
  },
  {
    id: "u-admin-001",
    email: "admin@gkislms.local",
    password: "admin123",
    name: "Admin User",
    role: "Admin",
  },
];

export function sanitizeUser(user: AuthUser): Omit<AuthUser, "password"> {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export function findUserByEmail(email: string): AuthUser | undefined {
  return users.find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase());
}

export function findUserById(id: string): AuthUser | undefined {
  return users.find((candidate) => candidate.id === id);
}

export function createUser(input: { email: string; password: string; name: string; role: RoleValue }): AuthUser {
  const normalizedEmail = input.email.trim().toLowerCase();
  const nextId = `u-${normalizedEmail.replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;

  const user: AuthUser = {
    id: nextId,
    email: normalizedEmail,
    password: input.password,
    name: input.name.trim(),
    role: input.role,
  };

  users.push(user);
  return user;
}

export function updateUserPassword(userId: string, newPassword: string): AuthUser | undefined {
  const user = findUserById(userId);
  if (!user) {
    return undefined;
  }
  user.password = newPassword;
  return user;
}
