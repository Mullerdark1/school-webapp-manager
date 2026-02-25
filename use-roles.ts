import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useMyRole() {
  return useQuery({
    queryKey: [api.roles.get.path],
    queryFn: async () => {
      const res = await fetch(api.roles.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user role");
      return api.roles.get.responses[200].parse(await res.json());
    },
    // Don't retry if auth fails, handled by useAuth
    retry: false, 
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { userId: string; role: "admin" | "teacher" | "student" }) => {
      const res = await fetch(api.roles.assign.path, {
        method: api.roles.assign.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to assign role");
      return api.roles.assign.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.roles.get.path] });
      toast({ title: "Success", description: "Role assigned successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
