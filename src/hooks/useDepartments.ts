import { useQuery } from "@tanstack/react-query";
import { STATIC_DEPARTMENTS } from "@/lib/static-data";

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => ({ success: true as const, data: STATIC_DEPARTMENTS }),
    staleTime: 5 * 60 * 1000,
  });
}
