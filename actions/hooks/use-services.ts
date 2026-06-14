"use client";

import { useQuery, useServerAction } from "./_base";
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from "@/actions/services";

export function useGetServices() { return useQuery(getAllServices); }
export function useCreateService() { return useServerAction(createService); }
export function useUpdateService() { return useServerAction(updateService); }
export function useDeleteService() { return useServerAction(deleteService); }
