"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toCamelCase } from "@/lib/utils/case";

export function useQuery<T, A extends unknown[]>(
  action: (...args: A) => Promise<T>,
  ...args: A
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const actionRef = useRef(action);
  const argsRef = useRef(args);
  actionRef.current = action;
  argsRef.current = args;

  const serializedArgs = JSON.stringify(args);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await actionRef.current(...argsRef.current);
      setData(toCamelCase<T>(result));
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serializedArgs]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, isLoading, refetch };
}

export function useMutation<T, A extends Record<string, unknown>>(
  action: (args: A) => Promise<T>
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (
      args: { data: A },
      options?: { onSuccess?: (data: T) => void; onError?: (error: Error) => void }
    ) => {
      setIsPending(true);
      setError(null);
      try {
        const result = await action(args.data);
        options?.onSuccess?.(result);
        return result;
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        options?.onError?.(err);
        return null;
      } finally {
        setIsPending(false);
      }
    },
    [action]
  );

  return { mutate, isPending, error };
}

export function useServerAction<T, A extends unknown[]>(action: (...args: A) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (...args: A): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await action(...args);
      setData(result);
      return result;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [action]);

  return { data, error, isLoading, execute };
}
