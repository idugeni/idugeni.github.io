"use client";

import { useQuery, useMutation, useServerAction } from "./_base";
import {
  adminLogin,
  adminLogout,
  getUnapprovedComments,
  approveComment,
  deleteComment,
} from "@/actions/admin";

export function useAdminLogin() {
  return useMutation(adminLogin);
}
export function useAdminLogout() { return useServerAction(adminLogout); }
export function useGetUnapprovedComments() { return useQuery(getUnapprovedComments); }
export function useApproveComment() { return useServerAction(approveComment); }
export function useDeleteComment() { return useServerAction(deleteComment); }
