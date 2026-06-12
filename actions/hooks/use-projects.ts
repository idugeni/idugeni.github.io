"use client";

import { useQuery, useServerAction } from "./_base";
import {
  getProjects,
  getProject,
  getProjectStats,
  createProject,
  updateProject,
  deleteProject,
} from "@/actions/projects";

export function useGetProjects(filters?: { kategori?: string; featured?: boolean; search?: string }) {
  return useQuery(getProjects, filters);
}
export function useGetProject(id: string) {
  return useQuery(getProject, id);
}
export function useGetProjectStats() { return useQuery(getProjectStats); }
export function useCreateProject() { return useServerAction(createProject); }
export function useUpdateProject() { return useServerAction(updateProject); }
export function useDeleteProject() { return useServerAction(deleteProject); }

export type CreateProjectBodyStatus = "ongoing" | "completed" | "archived";
