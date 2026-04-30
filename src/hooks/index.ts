import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/mockApi';
import type { Ticket, DashboardKPIs, PaginatedResponse } from '../types';

// Generic async hook
function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fn());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);
  return { data, loading, error, refetch: run };
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export function useKPIs() {
  return useAsync<DashboardKPIs>(() => api.getKPIs(), []);
}

export function useExpiryAlerts(days = 30) {
  return useAsync<Ticket[]>(() => api.getExpiryAlerts(days), [days]);
}

export function useMonthlyData() {
  return useAsync(() => api.getMonthlyData(), []);
}

// ── Tickets ──────────────────────────────────────────────────────────────────
export function useTickets(params: { search?: string; status?: string; priority?: string; insurer?: string; page?: number; pageSize?: number }) {
  const key = JSON.stringify(params);
  return useAsync<PaginatedResponse<Ticket>>(
    () => api.getTickets(params),
    [key]
  );
}

export function useTicket(id: string) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const t = await api.getTicketById(id);
    setTicket(t);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);
  return { ticket, loading, refetch: load, setTicket };
}

// ── Mutations ────────────────────────────────────────────────────────────────
export function useMutation<TArgs extends unknown[], TResult>(fn: (...args: TArgs) => Promise<TResult>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (...args: TArgs): Promise<TResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      return result;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
