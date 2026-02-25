import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  TrendingUp 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyRole } from "@/hooks/use-roles";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: roleData } = useMyRole();
  const role = roleData?.role;

  const statCards = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Active Classes",
      value: stats?.totalClasses || 0,
      icon: GraduationCap,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Present Today",
      value: stats?.presentToday || 0,
      icon: CalendarCheck,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening at Bossgee School today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, i) => (
            <Card key={i} className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-green-500 font-medium">+2.5%</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity / Hero Image Section */}
        <div className="rounded-2xl overflow-hidden relative min-h-[300px] shadow-lg group">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
          {/* School classroom / learning image */}
          <img 
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80" 
            alt="School environment"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="relative z-20 p-8 flex flex-col justify-end h-full min-h-[300px]">
            <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-fit mb-4">
              NEWS & UPDATES
            </span>
            <h2 className="text-3xl font-display font-bold text-white max-w-lg mb-2">
              End of Term Examinations approaching next week
            </h2>
            <p className="text-gray-200 max-w-md">
              Please ensure all student attendance records are up to date before the examination period begins.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
