import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useAssignRole } from "@/hooks/use-roles";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function Settings() {
  const { user } = useAuth();
  const assignRole = useAssignRole();
  const [targetUserId, setTargetUserId] = useState("");
  const [role, setRole] = useState<"admin" | "teacher" | "student">("student");

  const handleAssign = () => {
    if (!targetUserId) return;
    assignRole.mutate({ userId: targetUserId, role });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">System configuration and user roles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <img src={user?.profileImageUrl || ""} alt="Profile" className="w-16 h-16 rounded-full bg-secondary" />
                <div>
                  <h3 className="font-bold text-lg">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-sm font-medium">User ID:</p>
                <code className="text-xs bg-secondary p-1 rounded">{user?.id}</code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role Management (Admin)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Assign roles to users by their ID.</p>
              <div className="space-y-2">
                <label className="text-sm font-medium">User ID</label>
                <Input value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} placeholder="Enter User UUID" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={role} onValueChange={(val: any) => setRole(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAssign} disabled={assignRole.isPending} className="w-full mt-2">
                {assignRole.isPending ? "Assigning..." : "Assign Role"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
