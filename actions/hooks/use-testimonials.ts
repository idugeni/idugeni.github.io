"use client";

import { useQuery, useServerAction } from "./_base";
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/actions/testimonials";

export function useGetTestimonials() { return useQuery(getAllTestimonials); }
export function useCreateTestimonial() { return useServerAction(createTestimonial); }
export function useUpdateTestimonial() { return useServerAction(updateTestimonial); }
export function useDeleteTestimonial() { return useServerAction(deleteTestimonial); }
