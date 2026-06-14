"use client";

import { useQuery, useServerAction } from "./_base";
import {
  getNewsletterSubscribers,
  subscribeNewsletter,
  unsubscribeNewsletter,
} from "@/actions/newsletter";

export function useGetNewsletterSubscribers() { return useQuery(getNewsletterSubscribers); }
export function useSubscribeNewsletter() { return useServerAction(subscribeNewsletter); }
export function useUnsubscribeNewsletter() { return useServerAction(unsubscribeNewsletter); }
