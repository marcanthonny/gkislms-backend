import type { AuthUser } from "../interfaces/auth";

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
