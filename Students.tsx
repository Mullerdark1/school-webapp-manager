import { Layout } from "@/components/Layout";
import { useStudents, useCreateStudent, useDeleteStudent } from "@/hooks/use-students";
import { useClasses } from "@/hooks/use-classes";
import { useMyRole } from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Trash2, Filter, Loader2, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

type CreateStudentForm = z.infer<typeof insertStudentSchema>;

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const { data: roleData } = useMyRole();
  const isAdmin = roleData?.role === "admin";
  
  const { data: students, isLoading } = useStudents(
    selectedClass !== "all" ? parseInt(selectedClass) : undefined
  );
  const { data: classes } = useClasses();
  
  const createMutation = useCreateStudent();
  const deleteMutation = useDeleteStudent();

  const form = useForm<CreateStudentForm>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "male",
      parentName: "",
      parentPhone: "",
      address: "",
      // Dates handled specially or defaulting to string empty
    },
  });

  const onSubmit = (data: CreateStudentForm) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
      },
    });
  };

  const filteredStudents = students?.filter(student => 
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Students Directory</h1>
            <p className="text-muted-foreground">Manage student records and admissions</p>
          </div>
          
          {isAdmin && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">New Student Admission</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input {...form.register("firstName")} placeholder="John" />
                      {form.formState.errors.firstName && <span className="text-xs text-destructive">{form.formState.errors.firstName.message}</span>}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input {...form.register("lastName")} placeholder="Doe" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Admission Number</label>
                      <Input {...form.register("admissionNumber")} placeholder="ADM/2024/001" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Gender</label>
                      <Select onValueChange={(val) => form.setValue("gender", val as any)} defaultValue="male">
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Class</label>
                      <Select onValueChange={(val) => form.setValue("classId", parseInt(val))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes?.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date of Birth</label>
                      <Input type="date" {...form.register("dateOfBirth")} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Admission Date</label>
                      <Input type="date" {...form.register("admissionDate")} />
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4">
                    <h3 className="text-sm font-semibold mb-4 text-muted-foreground">Parent / Guardian Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <label className="text-sm font-medium">Parent Name</label>
                        <Input {...form.register("parentName")} placeholder="Guardian Name" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input {...form.register("parentPhone")} placeholder="+1234567890" />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium">Address</label>
                        <Input {...form.register("address")} placeholder="123 School Lane" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createMutation.isPending} className="bg-primary text-primary-foreground">
                      {createMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                      Save Student
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl shadow-sm border border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or ID..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-[200px]">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes?.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>ID Code</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Admission Date</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredStudents?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No students found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents?.map((student) => (
                  <TableRow key={student.id} className="hover:bg-secondary/20 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p>{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground capitalize">{student.gender}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{student.studentCode}</TableCell>
                    <TableCell>
                      {classes?.find(c => c.id === student.classId)?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{student.parentName}</p>
                      <p className="text-xs text-muted-foreground">{student.parentPhone}</p>
                    </TableCell>
                    <TableCell>{format(new Date(student.admissionDate), "MMM d, yyyy")}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this student?")) {
                              deleteMutation.mutate(student.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
