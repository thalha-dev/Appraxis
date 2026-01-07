import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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

export default function HrDashboard() {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<User[]>([]);
  const [appraisals, setAppraisals] = useState<AppraisalCycle[]>([]);
  const [pms, setPms] = useState<User[]>([]);
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPmDialogOpen, setIsPmDialogOpen] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [selectedPmId, setSelectedPmId] = useState<string>('');

  useEffect(() => {
    fetchEmployees();
    fetchPms();
    fetchAppraisals();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };
  
  const fetchPms = async () => {
    try {
      const response = await api.get('/users/pms');
      setPms(response.data);
    } catch (error) {
      console.error("Failed to fetch PMs", error);
    }
  };

  const fetchAppraisals = async () => {
    try {
      const response = await api.get('/appraisals');
      setAppraisals(response.data);
    } catch (error) {
      console.error("Failed to fetch appraisals", error);
    }
  };

  const handleInitiateAppraisal = async () => {
    if (!selectedEmployeeId || !year) return;
    try {
      await api.post('/appraisals', {
        employeeId: selectedEmployeeId,
        year: year
      });
      setIsDialogOpen(false);
      fetchAppraisals(); // Refresh list
      // Reset form
      setSelectedEmployeeId('');
      toast({
        title: "Appraisal Initiated",
        description: "The appraisal cycle has been created successfully.",
      });
    } catch (error: any) {
      console.error("Failed to initiate appraisal", error);
      toast({
        variant: "destructive",
        title: "Failed to Initiate",
        description: error.response?.data?.message || error.response?.data || "Could not create appraisal.",
      });
    }
  };
  
  const handleAssignPm = async () => {
      if (!selectedCycleId || !selectedPmId) return;
      try {
          await api.post(`/appraisals/${selectedCycleId}/assign-pm`, {
              pmId: parseInt(selectedPmId)
          });
          setIsPmDialogOpen(false);
          fetchAppraisals();
          setSelectedPmId('');
          setSelectedCycleId(null);
          toast({
            title: "PM Assigned",
            description: "The Project Manager has been assigned successfully.",
          });
      } catch (error: any) {
          console.error("Failed to assign PM", error);
          toast({
            variant: "destructive",
            title: "Failed to Assign PM",
            description: error.response?.data?.message || error.response?.data || "Could not assign PM.",
          });
      }
  };
  
  const openAssignPmDialog = (cycleId: number) => {
      setSelectedCycleId(cycleId);
      setIsPmDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-500 hover:bg-green-600';
      case 'PENDING_PM_REVIEW': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'CLOSED': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">HR Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {/* Initiate Card */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Start New Appraisal</CardTitle>
            <CardDescription>
              Initiate a performance review cycle for an employee.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Initiate Appraisal</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Initiate Appraisal</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="employee" className="text-right">
                      Employee
                    </Label>
                    <Select onValueChange={setSelectedEmployeeId} value={selectedEmployeeId}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="year" className="text-right">
                      Year
                    </Label>
                    <Input
                      id="year"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleInitiateAppraisal}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Progress Board */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Ongoing Appraisals</CardTitle>
            <CardDescription>
              Overview of all active appraisal cycles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appraisals.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">No active appraisals found.</TableCell>
                    </TableRow>
                ) : (
                    appraisals.map((appraisal) => (
                    <TableRow key={appraisal.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{appraisal.employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {appraisal.employee.name}
                        </TableCell>
                        <TableCell>{appraisal.startDate}</TableCell>
                        <TableCell>
                        <Badge className={`${getStatusColor(appraisal.status)} text-white`}>
                            {appraisal.status.replace(/_/g, ' ')}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            {appraisal.status === 'OPEN' && (
                                <Button size="sm" variant="outline" onClick={() => openAssignPmDialog(appraisal.id)}>Assign PM</Button>
                            )}
                        </TableCell>
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Assign PM Dialog */}
      <Dialog open={isPmDialogOpen} onOpenChange={setIsPmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
            <DialogTitle>Assign Project Manager</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pm" className="text-right">
                Manager
            </Label>
            <Select onValueChange={setSelectedPmId} value={selectedPmId}>
                <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select Project Manager" />
                </SelectTrigger>
                <SelectContent>
                {pms.map(pm => (
                    <SelectItem key={pm.id} value={pm.id.toString()}>
                    {pm.name}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>
        </div>
        <DialogFooter>
            <Button onClick={handleAssignPm}>Assign</Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
