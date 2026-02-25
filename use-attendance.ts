import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useAttendance(classId: number | undefined, date: Date | undefined) {
  return useQuery({
    queryKey: [api.attendance.get.path, classId, date],
    queryFn: async () => {
      if (!classId || !date) return [];
      
      const dateStr = date.toISOString().split('T')[0];
      const url = `${api.attendance.get.path}?classId=${classId}&date=${dateStr}`;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return api.attendance.get.responses[200].parse(await res.json());
    },
    enabled: !!classId && !!date,
  });
}

type MarkAttendanceInput = z.infer<typeof api.attendance.mark.input>;

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: MarkAttendanceInput) => {
      const res = await fetch(api.attendance.mark.path, {
        method: api.attendance.mark.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to mark attendance");
      return api.attendance.mark.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.attendance.get.path, variables.classId] 
      });
      toast({ title: "Success", description: "Attendance marked successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
