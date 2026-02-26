/**
 * Re-exports useAuth from the AuthContext for convenience,
 * and provides mutation hooks for login/register/logout that
 * integrate with TanStack Query's loading/error state.
 */
export { useAuth } from "@/contexts/AuthContext";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { complaintsKeys } from "./useComplaints";

export function useLoginMutation() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  });
}

export function useRegisterMutation() {
  const { register } = useAuth();
  return useMutation({
    mutationFn: ({
      name, email, password, district,
    }: { name: string; email: string; password: string; district?: string }) =>
      register(name, email, password, district),
  });
}

export function useLogoutMutation() {
  const { logout } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all cached data on logout
      qc.removeQueries({ queryKey: complaintsKeys.mine });
      qc.clear();
    },
  });
}
