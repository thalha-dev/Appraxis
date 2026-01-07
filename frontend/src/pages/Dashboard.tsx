import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, ClipboardList, Clock, CheckCircle } from 'lucide-react';

interface User {
  id: number;
  name: string;
  username: string;
}

interface AppraisalCycle {
  id: number;
  employee: User;
  startDate: string;
  status: string;
  year: string;
}

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [appraisals, setAppraisals] = useState<AppraisalCycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect users to their appropriate dashboard based on role priority
    // HR stays here (shows stats), others get redirected
    if (hasRole('HR')) {
      fetchAppraisals();
    } else if (hasRole('BOSS')) {
      navigate('/boss-dashboard', { replace: true });
    } else if (hasRole('PROJECT_MANAGER')) {
      navigate('/pm-dashboard', { replace: true });
    } else if (hasRole('EMPLOYEE')) {
      navigate('/employee-dashboard', { replace: true });
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const fetchAppraisals = async () => {
    try {
      const response = await api.get('/appraisals');
      setAppraisals(response.data);
    } catch (error) {
      console.error("Failed to fetch appraisals", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-500 hover:bg-blue-600';
      case 'PENDING_PM_REVIEW': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'PENDING_BOSS_REVIEW': return 'bg-orange-500 hover:bg-orange-600';
      case 'CLOSED': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const pendingAppraisals = appraisals.filter(a => a.status !== 'CLOSED');
  const openCount = appraisals.filter(a => a.status === 'OPEN').length;
  const pendingReviewCount = appraisals.filter(a => a.status === 'PENDING_PM_REVIEW' || a.status === 'PENDING_BOSS_REVIEW').length;
  const closedCount = appraisals.filter(a => a.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      {hasRole('HR') && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appraisals</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appraisals.length}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openCount}</div>
                <p className="text-xs text-muted-foreground">Awaiting PM assignment</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingReviewCount}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{closedCount}</div>
                <p className="text-xs text-muted-foreground">This cycle</p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Appraisals Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Appraisals</CardTitle>
              <CardDescription>Appraisals that require attention</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-4">Loading...</p>
              ) : pendingAppraisals.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No pending appraisals. All caught up!</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingAppraisals.map((appraisal) => (
                      <TableRow key={appraisal.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{appraisal.employee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {appraisal.employee.name}
                          </div>
                        </TableCell>
                        <TableCell>{appraisal.startDate}</TableCell>
                        <TableCell>{appraisal.year}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(appraisal.status)} text-white`}>
                            {appraisal.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!hasRole('HR') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Your Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.roles?.map(r => r.replace(/_/g, ' ')).join(', ')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Use the sidebar to navigate to your dashboards
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
