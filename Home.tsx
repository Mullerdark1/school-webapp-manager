import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  // Marketing Landing Page
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-display font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Bossgee
          </div>
          <a 
            href="/api/login" 
            className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity text-sm"
          >
            Sign In
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="font-display text-5xl lg:text-7xl font-bold leading-tight">
              Modern School <br />
              <span className="text-primary">Management</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg">
              Streamline admissions, attendance, and student data with a beautiful, intuitive platform designed for excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/api/login"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-lg text-center hover:shadow-xl hover:shadow-primary/25 transition-all hover:-translate-y-1"
              >
                Get Started
              </a>
              <button className="px-8 py-4 rounded-xl font-bold text-lg text-foreground border-2 border-border hover:bg-secondary/50 transition-colors">
                Learn More
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl rounded-full" />
            {/* Using a tech/education related abstract image */}
            <img 
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80" 
              alt="Dashboard Preview"
              className="relative rounded-2xl shadow-2xl border border-white/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
