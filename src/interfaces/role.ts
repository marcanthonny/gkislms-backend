export type RoleValue = "Student" | "Teacher" | "Admin";
export type RoleCategory = "Teaching" | "Learning";

export interface Role {
  category: RoleCategory;
  value: RoleValue;
  label: string;
  subtitle: string;
  university: string;
}

export interface ErrorResponse {
  error: string;
  details?: string;
}
