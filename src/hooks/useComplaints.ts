import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { complaintsApi, type ApiComplaintDetail } from "@/lib/api";

// ─── Query keys ───────────────────────────────────────────────────────────────
export const complaintsKeys = {
  all:    ["complaints"] as const,
  lists:  () => [...complaintsKeys.all, "list"] as const,
  list:   (filters: Record<string, string>) => [...complaintsKeys.lists(), filters] as const,
  detail: (id: string) => [...complaintsKeys.all, "detail", id] as const,
  mine:   ["complaints", "mine"] as const,
};

// ─── List complaints (public) ─────────────────────────────────────────────────
export function useComplaints(filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: complaintsKeys.list(filters),
    queryFn:  () => complaintsApi.list(filters),
  });
}

// ─── Single complaint ─────────────────────────────────────────────────────────
export function useComplaint(id: string) {
  return useQuery({
    queryKey: complaintsKeys.detail(id),
    queryFn:  () => complaintsApi.get(id),
    enabled:  !!id,
  });
}

// ─── My complaints (authenticated) ───────────────────────────────────────────
export function useMyComplaints() {
  return useQuery({
    queryKey: complaintsKeys.mine,
    queryFn:  complaintsApi.myComplaints,
  });
}

// ─── Submit a new complaint ───────────────────────────────────────────────────
export function useSubmitComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: complaintsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: complaintsKeys.lists() });
      qc.invalidateQueries({ queryKey: complaintsKeys.mine });
    },
  });
}

// ─── Update status ────────────────────────────────────────────────────────────
export function useUpdateComplaintStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      complaintsApi.updateStatus(id, status, note),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: complaintsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: complaintsKeys.lists() });
      qc.invalidateQueries({ queryKey: complaintsKeys.mine });
    },
  });
}

// ─── Assign department ────────────────────────────────────────────────────────
export function useAssignDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, departmentId }: { id: string; departmentId: string }) =>
      complaintsApi.assign(id, departmentId),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: complaintsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: complaintsKeys.lists() });
    },
  });
}

// ─── Upvote ───────────────────────────────────────────────────────────────────
export function useUpvoteComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => complaintsApi.upvote(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: complaintsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: complaintsKeys.lists() });
    },
  });
}
