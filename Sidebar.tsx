import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMyRole } from "@/hooks/use-roles";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  Settings, 
  LogOut,
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: roleData } = useMyRole();
  const role = roleData?.role || "student";

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "teacher", "student"] },
    { label: "Students", href: "/students", icon: Users, roles: ["admin", "teacher"] },
    { label: "Classes", href: "/classes", icon: GraduationCap, roles: ["admin"] },
    { label: "Attendance", href: "/attendance", icon: CalendarCheck, roles: ["admin", "teacher"] },
    { label: "My Profile", href: "/profile", icon: UserCircle, roles: ["student"] },
    { label: "My Attendance", href: "/my-attendance", icon: CalendarCheck, roles: ["student"] },
    { label: "Settings", href: "/settings", icon: Settings, roles: ["admin"] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(role));

  return (
    <div className="h-screen w-64 bg-card border-r border-border flex flex-col shadow-sm fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-border/50">
        <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Bossgee
        </h1>
        <p className="text-xs text-muted-foreground font-medium mt-1">School Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/30 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase overflow-hidden">
             {user?.profileImageUrl ? (
               <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               user?.firstName?.[0] || "U"
             )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.firstName || "User"}</p>
            <p className="text-xs text-muted-foreground truncate capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
