import { Layout } from "@/components/Layout";
import { useClasses } from "@/hooks/use-classes";
import { useStudents } from "@/hooks/use-students";
import { useAttendance, useMarkAttendance } from "@/hooks/use-attendance";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Attendance() {
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>();
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  
  const { data: classes } = useClasses();
  const { data: students } = useStudents(selectedClassId);
  const { data: existingAttendance } = useAttendance(selectedClassId, date ? new Date(date) : undefined);
  const markMutation = useMarkAttendance();

  // Local state for attendance form
  const [records, setRecords] = useState<Record<number, "present" | "absent" | "late">>({});

  // Populate local state when students load or attendance data arrives
  useEffect(() => {
    if (students) {
      const initialRecords: Record<number, "present" | "absent" | "late"> = {};
      students.forEach(s => {
        // Default to present if no existing record, or use existing record
        const existing = existingAttendance?.find(a => a.studentId === s.id);
        initialRecords[s.id] = (existing?.status as any) || "present";
      });
      setRecords(initialRecords);
    }
  }, [students, existingAttendance]);

  const handleSubmit = () => {
    if (!selectedClassId) return;
    const formattedRecords = Object.entries(records).map(([studentId, status]) => ({
      studentId: parseInt(studentId),
      status,
    }));
    
    markMutation.mutate({
      classId: selectedClassId,
      date,
      records: formattedRecords
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Class Attendance</h1>
          <p className="text-muted-foreground">Mark daily attendance for students</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border/50 shadow-sm flex flex-col md:flex-row gap-6 items-end">
          <div className="w-full md:w-64 space-y-2">
            <label className="text-sm font-medium">Select Class</label>
            <Select onValueChange={(v) => setSelectedClassId(parseInt(v))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a class..." />
              </SelectTrigger>
              <SelectContent>
                {classes?.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-64 space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>
        </div>

        {selectedClassId ? (
          <div className="bg-card rounded-xl border border-border/50 shadow-lg overflow-hidden">
            <div className="p-4 bg-secondary/30 border-b border-border/50 flex justify-between items-center">
              <h3 className="font-semibold">Student List</h3>
              <div className="text-sm text-muted-foreground">
                {students?.length || 0} Students
              </div>
            </div>
            
            <div className="divide-y divide-border/50">
              {students?.map((student) => (
                <div key={student.id} className="p-4 flex items-center justify-between hover:bg-secondary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-muted-foreground">{student.studentCode}</p>
                    </div>
                  </div>

                  <RadioGroup 
                    value={records[student.id] || "present"}
                    onValueChange={(val) => setRecords(prev => ({ ...prev, [student.id]: val as any }))}
                    className="flex gap-4"
                  >
                    <div className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer border transition-all ${records[student.id] === 'present' ? 'bg-green-500/10 border-green-500 text-green-700' : 'border-transparent hover:bg-secondary'}`}>
                      <RadioGroupItem value="present" id={`present-${student.id}`} className="text-green-500" />
                      <label htmlFor={`present-${student.id}`} className="cursor-pointer font-medium text-sm flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Present
                      </label>
                    </div>

                    <div className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer border transition-all ${records[student.id] === 'absent' ? 'bg-red-500/10 border-red-500 text-red-700' : 'border-transparent hover:bg-secondary'}`}>
                      <RadioGroupItem value="absent" id={`absent-${student.id}`} className="text-red-500" />
                      <label htmlFor={`absent-${student.id}`} className="cursor-pointer font-medium text-sm flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Absent
                      </label>
                    </div>

                    <div className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer border transition-all ${records[student.id] === 'late' ? 'bg-orange-500/10 border-orange-500 text-orange-700' : 'border-transparent hover:bg-secondary'}`}>
                      <RadioGroupItem value="late" id={`late-${student.id}`} className="text-orange-500" />
                      <label htmlFor={`late-${student.id}`} className="cursor-pointer font-medium text-sm flex items-center gap-1">
                         <Clock className="w-4 h-4" /> Late
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>

            <div className="p-6 bg-secondary/10 border-t border-border/50 flex justify-end">
              <Button 
                size="lg" 
                onClick={handleSubmit} 
                disabled={markMutation.isPending}
                className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              >
                {markMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Attendance"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">Select a class to start marking attendance.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
