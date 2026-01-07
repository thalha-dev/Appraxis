import { useAuth } from '@/context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Outlet, Link } from 'react-router-dom';

export function MainLayout() {
  const { user, logout, hasRole } = useAuth();

  // Get display role - show the "highest" additional role, or EMPLOYEE if no additional roles
  const getDisplayRole = () => {
    if (hasRole('BOSS')) return 'BOSS';
    if (hasRole('HR')) return 'HR';
    if (hasRole('PROJECT_MANAGER')) return 'PROJECT_MANAGER';
    return 'EMPLOYEE';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="border-b h-16 flex items-center justify-between px-6 bg-card">
        <h1 className="text-xl font-bold">Appraxis</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{getDisplayRole()}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/20 p-6 hidden md:block">
          <nav className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Navigation</h2>
            
            {/* Everyone who is an employee (which is everyone) gets My Performance */}
            {hasRole('EMPLOYEE') && (
              <Link to="/employee-dashboard">
                <Button variant="ghost" className="w-full justify-start">My Performance</Button>
              </Link>
            )}
            
            {/* Role-specific menus */}
            {hasRole('HR') && (
              <Link to="/hr-dashboard">
                <Button variant="ghost" className="w-full justify-start">HR Console</Button>
              </Link>
            )}
            {hasRole('PROJECT_MANAGER') && (
              <Link to="/pm-dashboard">
                <Button variant="ghost" className="w-full justify-start">Manager Dashboard</Button>
              </Link>
            )}
            {hasRole('BOSS') && (
              <Link to="/boss-dashboard">
                <Button variant="ghost" className="w-full justify-start">Executive Dashboard</Button>
              </Link>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
