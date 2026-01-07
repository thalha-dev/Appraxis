import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from 'react-router-dom';

interface PmReview {
  id: number;
  appraisalCycle: {
    employee: {
      name: string;
    };
    year: string;
  };
  status: string;
  feedbackDate: string | null;
}

export default function PmDashboard() {
  const [reviews, setReviews] = useState<PmReview[]>([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/pm/pending-reviews');
      setReviews(response.data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manager Dashboard</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
          <CardDescription>
            Appraisals waiting for your feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No pending reviews.
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{review.appraisalCycle.employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {review.appraisalCycle.employee.name}
                    </TableCell>
                    <TableCell>{review.appraisalCycle.year}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {review.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/pm/reviews/${review.id}`}>
                        <Button size="sm">Start Review</Button>
                      </Link>
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
