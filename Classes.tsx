import { Layout } from "@/components/Layout";
import { useClasses, useCreateClass } from "@/hooks/use-classes";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GraduationCap, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Classes() {
  const { data: classes, isLoading } = useClasses();
  const createMutation = useCreateClass();
  const [newClassName, setNewClassName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = () => {
    if (!newClassName) return;
    createMutation.mutate({ name: newClassName }, {
      onSuccess: () => {
        setIsOpen(false);
        setNewClassName("");
      }
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
             <h1 className="font-display text-3xl font-bold">Class Management</h1>
             <p className="text-muted-foreground">Create and manage grade levels</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class Name</label>
                  <Input 
                    placeholder="e.g. JSS 1 Alpha" 
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                   <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                   <Button onClick={handleCreate} disabled={createMutation.isPending}>
                     {createMutation.isPending && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
                     Create
                   </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
           <div className="flex justify-center p-12">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes?.map((c) => (
              <Card key={c.id} className="hover:shadow-md transition-shadow group">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{c.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Class ID: {c.id}</p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
