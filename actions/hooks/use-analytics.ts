"use client";

import { useQuery, useServerAction } from "./_base";
import {
  getAnalyticsSummary,
  getPageViewsChart,
  getTopPages,
  trackPageView,
} from "@/actions/analytics";

export function useGetAnalyticsSummary() { return useQuery(getAnalyticsSummary); }
export function useGetPageViewsChart() { return useQuery(getPageViewsChart); }
export function useGetTopPages() { return useQuery(getTopPages); }
export function useTrackPageView() { return useServerAction(trackPageView); }
