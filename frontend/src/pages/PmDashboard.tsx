import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface PmReview {
  id: number;
  appraisalCycle: {
    employee: {
      name: string;
    };
    year: string;
    status: string;
  };
  status: string;
  feedbackDate: string | null;
}

interface ClarificationItem {
  pmRatingId: number;
  questionText: string;
  pmName: string;
  rating: number;
  comment: string;
  existingClarification: string | null;
}

export default function PmDashboard() {
  const [pendingReviews, setPendingReviews] = useState<PmReview[]>([]);
  const [submittedReviews, setSubmittedReviews] = useState<PmReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<PmReview | null>(null);
  const [clarifications, setClarifications] = useState<ClarificationItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const [pendingRes, submittedRes] = await Promise.all([
        api.get('/pm/pending-reviews'),
        api.get('/pm/submitted-reviews')
      ]);
      setPendingReviews(pendingRes.data);
      setSubmittedReviews(submittedRes.data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
  };

  const viewClarifications = async (review: PmReview) => {
    setSelectedReview(review);
    try {
      const response = await api.get(`/pm/reviews/${review.id}/clarifications`);
      setClarifications(response.data);
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch clarifications", error);
    }
  };

  const hasClarifications = (items: ClarificationItem[]) => {
    return items.some(item => item.existingClarification);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manager Dashboard</h2>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Reviews
            {pendingReviews.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingReviews.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted Reviews
            {submittedReviews.length > 0 && (
              <Badge variant="outline" className="ml-2">{submittedReviews.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
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
                  {pendingReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No pending reviews.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pendingReviews.map((review) => (
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
        </TabsContent>

        <TabsContent value="submitted">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Reviews</CardTitle>
              <CardDescription>
                Reviews you have completed. View employee clarifications here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Cycle</TableHead>
                    <TableHead>Appraisal Status</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submittedReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No submitted reviews yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    submittedReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{review.appraisalCycle.employee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {review.appraisalCycle.employee.name}
                        </TableCell>
                        <TableCell>{review.appraisalCycle.year}</TableCell>
                        <TableCell>
                          <Badge variant={review.appraisalCycle.status === 'CLOSED' ? 'default' : 'secondary'}>
                            {review.appraisalCycle.status.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {review.feedbackDate ? new Date(review.feedbackDate).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => viewClarifications(review)}>
                            View Clarifications
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Review Details - {selectedReview?.appraisalCycle.employee.name} ({selectedReview?.appraisalCycle.year})
            </DialogTitle>
            <DialogDescription>
              Your ratings and employee clarifications for this appraisal.
            </DialogDescription>
          </DialogHeader>
          
          {clarifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No ratings found for this review.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {clarifications.map((item) => (
                <AccordionItem value={item.pmRatingId.toString()} key={item.pmRatingId}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4 text-left">
                      <span className="font-medium text-sm">{item.questionText}</span>
                      <div className="flex items-center gap-2">
                        {item.existingClarification && (
                          <Badge variant="default" className="bg-blue-500">Has Reply</Badge>
                        )}
                        <Badge variant="outline">{item.rating}/10</Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4 px-1">
                    <div className="bg-muted p-4 rounded-md">
                      <p className="text-sm font-semibold mb-1">Your Comment:</p>
                      {item.comment ? (
                        <p className="italic text-muted-foreground">"{item.comment}"</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No comment provided.</p>
                      )}
                    </div>
                    
                    {item.existingClarification ? (
                      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-semibold mb-1 text-blue-700 dark:text-blue-300">Employee's Clarification:</p>
                        <p className="text-blue-600 dark:text-blue-400">{item.existingClarification}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-muted-foreground italic">No clarification from employee yet.</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {!hasClarifications(clarifications) && clarifications.length > 0 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              The employee hasn't submitted any clarifications yet.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
