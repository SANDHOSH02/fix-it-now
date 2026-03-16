import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { STATIC_COMPLAINTS, STATIC_MY_COMPLAINTS } from "@/lib/static-data";
import type { ApiComplaintDetail } from "@/lib/api";

// ─── Query keys ───────────────────────────────────────────────────────────────
export const complaintsKeys = {
  all:    ["complaints"] as const,
  lists:  () => [...complaintsKeys.all, "list"] as const,
  list:   (filters: Record<string, string>) => [...complaintsKeys.lists(), filters] as const,
  detail: (id: string) => [...complaintsKeys.all, "detail", id] as const,
  mine:   ["complaints", "mine"] as const,
};

// ─── List complaints (static) ────────────────────────────────────────────────
export function useComplaints(filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: complaintsKeys.list(filters),
    queryFn: async () => {
      const pageSize = parseInt(filters.pageSize ?? "100", 10);
      const data = STATIC_COMPLAINTS.slice(0, pageSize);
      return {
        success: true as const,
        data,
        meta: { total: STATIC_COMPLAINTS.length, page: 1, pageSize, totalPages: 1 },
      };
    },
  });
}

// ─── Single complaint (static) ───────────────────────────────────────────────
export function useComplaint(id: string) {
  return useQuery({
    queryKey: complaintsKeys.detail(id),
    queryFn: async () => {
      const found = STATIC_COMPLAINTS.find((c) => c.id === id);
      if (!found) throw new Error("Not found");
      return { success: true as const, data: found };
    },
    enabled: !!id,
  });
}

// ─── My complaints (static) ─────────────────────────────────────────────────
export function useMyComplaints() {
  return useQuery({
    queryKey: complaintsKeys.mine,
    queryFn: async () => ({ success: true as const, data: STATIC_MY_COMPLAINTS }),
  });
}

// ─── Submit a new complaint (no-op) ──────────────────────────────────────────
export function useSubmitComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      title: string; category: string; description: string;
      lat: number; lng: number; address: string; city: string; district: string;
      photoUrl?: string;
    }) => {
      const newComplaint: ApiComplaintDetail = {
        id: `c${Date.now()}`, refId: `FIN-2026-${Date.now()}`,
        title: body.title, category: body.category, description: body.description,
        status: "reported", priority: "medium",
        lat: body.lat, lng: body.lng, address: body.address, city: body.city, district: body.district,
        photoUrl: body.photoUrl, aiConfidence: 0.85, upvotes: 0, isDuplicate: false,
        createdAt: new Date().toISOString(),
        reporter: { id: "u1", name: "Sandhosh G" },
        statusHistory: [{ id: `sh${Date.now()}`, status: "reported", createdAt: new Date().toISOString() }],
      };
      STATIC_COMPLAINTS.unshift(newComplaint);
      return { success: true as const, data: { complaint: newComplaint, isDuplicate: false } };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: complaintsKeys.lists() });
      qc.invalidateQueries({ queryKey: complaintsKeys.mine });
    },
  });
}

// ─── Update status (static) ─────────────────────────────────────────────────
export function useUpdateComplaintStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const c = STATIC_COMPLAINTS.find((x) => x.id === id);
      if (c) {
        c.status = status;
        c.statusHistory.push({ id: `sh${Date.now()}`, status, note, createdAt: new Date().toISOString() });
      }
      return { success: true as const, data: c! };
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: complaintsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: complaintsKeys.lists() });
      qc.invalidateQueries({ queryKey: complaintsKeys.mine });
    },
  });
}

// ─── Assign department (static) ──────────────────────────────────────────────
export function useAssignDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, departmentId }: { id: string; departmentId: string }) => {
      const c = STATIC_COMPLAINTS.find((x) => x.id === id);
      if (c) c.department = { id: departmentId, name: departmentId };
      return { success: true as const, data: c! };
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: complaintsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: complaintsKeys.lists() });
    },
  });
}

// ─── Upvote (static) ─────────────────────────────────────────────────────────
export function useUpvoteComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const c = STATIC_COMPLAINTS.find((x) => x.id === id);
      if (c) c.upvotes += 1;
      return { success: true as const, data: { id, upvotes: c?.upvotes ?? 0 } };
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: complaintsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: complaintsKeys.lists() });
    },
  });
}
