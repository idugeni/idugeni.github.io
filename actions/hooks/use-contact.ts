"use client";

import { useQuery, useServerAction } from "./_base";
import {
  getContactMessages,
  markMessageRead,
  submitContactMessage,
} from "@/actions/contact";

export function useGetContactMessages(filters?: { dibaca?: boolean }) {
  return useQuery(getContactMessages, filters);
}
export function useMarkMessageRead() { return useServerAction(markMessageRead); }
export function useSendContactMessage() { return useServerAction(submitContactMessage); }
