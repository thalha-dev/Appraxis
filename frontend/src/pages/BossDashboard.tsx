import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  name: string;
  designation: string;
}

interface AppraisalCycle {
  id: number;
  employee: User;
  startDate: string;
  status: string;
  year: string;
}

export default function BossDashboard() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<AppraisalCycle[]>([]);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      const response = await api.get('/boss/pending');
      setReviews(response.data);
    } catch (error) {
      console.error("Failed to fetch pending reviews", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-green-500';
      case 'PENDING_PM_REVIEW': return 'bg-yellow-500';
      case 'PENDING_BOSS_REVIEW': return 'bg-purple-500';
      case 'CLOSED': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Executive Dashboard</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Appraisals</CardTitle>
          <CardDescription>
            Review and finalize employee performance cycles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">No pending reviews found.</TableCell>
                  </TableRow>
              ) : (
                  reviews.map((review) => (
                  <TableRow key={review.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                          <AvatarFallback>{review.employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {review.employee.name}
                      </TableCell>
                      <TableCell>{review.employee.designation}</TableCell>
                      <TableCell>
                      <Badge className={`${getStatusColor(review.status)} text-white`}>
                          {review.status.replace(/_/g, ' ')}
                      </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => navigate(`/boss/review/${review.id}`)}>
                            Review & Close
                        </Button>
                      </TableCell>
                  </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
