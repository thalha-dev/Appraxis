import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FeedbackViewDto {
  pmRatingId: number;
  questionText: string;
  pmName: string;
  rating: number;
  comment: string;
  existingClarification: string | null;
}

interface ReportDto {
  questionText: string;
  category: string;
  pmAverageRating: number;
  selfRating: number | null;
}

interface BossSummaryDto {
  cycleId: number;
  employeeName: string;
  designation: string;
  status: string;
  reports: ReportDto[];
  clarifications: FeedbackViewDto[];
}

export default function BossReviewPage() {
  const { cycleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [summary, setSummary] = useState<BossSummaryDto | null>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await api.get(`/boss/summary/${cycleId}`);
      setSummary(response.data);
    } catch (error) {
      console.error("Failed to fetch summary", error);
    }
  };

  const handleFinalize = async () => {
    try {
      await api.post(`/boss/close/${cycleId}`);
      toast({
        title: "Appraisal Finalized",
        description: "The appraisal cycle has been closed successfully.",
      });
      navigate('/boss-dashboard');
    } catch (error) {
      console.error("Failed to finalize", error);
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: "Could not finalize the appraisal.",
      });
    }
  };

  if (!summary) return <div>Loading...</div>;

  const chartData = summary.reports.map(d => ({
    subject: d.category,
    fullQuestion: d.questionText,
    PM: d.pmAverageRating,
    Self: d.selfRating || 0
  }));

  // Filter items with replies to highlight
  const clarifiedItems = summary.clarifications.filter(c => c.existingClarification);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">{summary.employeeName}</h2>
            <p className="text-muted-foreground">{summary.designation} • {summary.status}</p>
        </div>
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size="lg" variant={summary.status === 'CLOSED' ? "outline" : "default"} disabled={summary.status === 'CLOSED'}>
                    {summary.status === 'CLOSED' ? 'Appraisal Closed' : 'Finalize Appraisal'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will lock the appraisal cycle and notify HR. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleFinalize}>Confirm Finalization</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Manager vs Self Assessment</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} />
                        <Radar name="Manager Avg" dataKey="PM" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
                        <Radar name="Self Rating" dataKey="Self" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.6} />
                        <Legend />
                    </RadarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Clarifications & Replies</CardTitle>
                <CardDescription>
                    {clarifiedItems.length > 0 ? 
                        <span className="text-amber-600 font-medium">{clarifiedItems.length} items require attention</span> : 
                        "No clarifications raised by employee"
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {summary.clarifications.map((item) => (
                        <AccordionItem value={item.pmRatingId.toString()} key={item.pmRatingId}>
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4 text-left">
                                    <span className="font-medium truncate max-w-[200px]">{item.questionText}</span>
                                    {item.existingClarification && (
                                        <Badge variant="destructive" className="ml-2">Replied</Badge>
                                    )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4 px-1">
                                <div className="bg-muted p-3 rounded-md">
                                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Manager ({item.pmName}) - {item.rating}/10</p>
                                    <p className="italic">"{item.comment}"</p>
                                </div>
                                {item.existingClarification && (
                                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md border border-blue-100 dark:border-blue-900">
                                        <p className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-300 mb-1">Employee Reply</p>
                                        <p className="text-blue-600 dark:text-blue-400">{item.existingClarification}</p>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                {summary.clarifications.length === 0 && (
                    <p className="text-center text-muted-foreground py-10">No comments available.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
