import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReportData {
  questionText: string;
  category: string;
  pmAverageRating: number;
  selfRating: number | null;
}

interface Question {
  id: number;
  text: string;
  category: string;
}

interface SelfRatingSubmission {
  questionId: number;
  rating: number;
  comment: string;
}

interface FeedbackItem {
  pmRatingId: number;
  questionText: string;
  pmName: string;
  rating: number;
  comment: string;
  existingClarification: string | null;
}

interface AppraisalCycleData {
  id: number;
  year: string;
  startDate: string;
  status: string;
  selfAssessmentSubmitted: boolean;
}

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

export default function EmployeeDashboard() {
  const { toast } = useToast();
  const [allCycles, setAllCycles] = useState<AppraisalCycleData[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<AppraisalCycleData | null>(null);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<SelfRatingSubmission[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [replyText, setReplyText] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllCycles();
  }, []);

  useEffect(() => {
    if (selectedCycle) {
      fetchReport();
      fetchQuestions();
      fetchFeedback();
    }
  }, [selectedCycle]);

  const fetchAllCycles = async () => {
    try {
      const response = await api.get('/employee/cycles');
      const cycles = response.data;
      setAllCycles(cycles);
      // Auto-select the most recent cycle if available
      if (cycles.length > 0) {
        setSelectedCycle(cycles[0]);
      }
    } catch (error) {
      console.error("Failed to fetch cycles", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCycleChange = (cycleId: string) => {
    const cycle = allCycles.find(c => c.id.toString() === cycleId);
    if (cycle) {
      setSelectedCycle(cycle);
    }
  };

  const fetchReport = async () => {
    try {
      const response = await api.get(`/employee/report/${selectedCycle!.id}`);
      setReportData(response.data);
    } catch (error) {
      console.error("Failed to fetch report", error);
    }
  };
  
  const fetchFeedback = async () => {
      try {
          const response = await api.get(`/employee/feedback/${selectedCycle!.id}`);
          setFeedbackList(response.data);
      } catch (error) {
          console.error("Failed to fetch feedback", error);
      }
  };

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/questions');
      const data = response.data;
      setQuestions(data);
      // Initialize self assessment state
      setSubmissions(data.map((q: Question) => ({
        questionId: q.id,
        rating: 5,
        comment: ''
      })));
    } catch (error) {
      console.error("Failed to fetch questions", error);
    }
  };

  const handleRatingChange = (index: number, value: number[]) => {
    const newSubmissions = [...submissions];
    newSubmissions[index].rating = value[0];
    setSubmissions(newSubmissions);
  };

  const handleCommentChange = (index: number, value: string) => {
    const newSubmissions = [...submissions];
    newSubmissions[index].comment = value;
    setSubmissions(newSubmissions);
  };

  const handleSubmitAssessment = async () => {
    if (!selectedCycle) return;
    try {
      await api.post(`/employee/self-assessment/${selectedCycle.id}`, submissions);
      toast({
        title: "Assessment Submitted",
        description: "Your self-assessment has been saved.",
      });
      fetchReport(); // Refresh graphs
      fetchAllCycles(); // Refresh cycles to update selfAssessmentSubmitted flag
    } catch (error: any) {
      console.error("Failed to submit assessment", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.response?.data?.message || "Please try again later.",
      });
    }
  };
  
  const handleReplyChange = (id: number, text: string) => {
      setReplyText(prev => ({...prev, [id]: text}));
  };
  
  const submitReply = async (pmRatingId: number) => {
      try {
          await api.post('/employee/clarify', {
              pmRatingId,
              replyText: replyText[pmRatingId]
          });
          toast({
              title: "Reply Sent",
              description: "Your clarification has been submitted.",
          });
          fetchFeedback(); // Refresh list
      } catch (error) {
          console.error("Failed to submit reply", error);
           toast({
              variant: "destructive",
              title: "Submission Failed",
              description: "Please try again later.",
          });
      }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-500';
      case 'PENDING_PM_REVIEW': return 'bg-yellow-500';
      case 'PENDING_BOSS_REVIEW': return 'bg-orange-500';
      case 'CLOSED': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full pt-10">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (allCycles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full pt-10">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No appraisal cycles found. Your HR team will initiate your appraisal cycle.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform data for charts
  // Radar Chart: Aggregate by Category? Or show all questions if small number.
  // Requirement says "Question Categories (or specific Questions if few)". We have 5 questions.
  const chartData = reportData.map(d => ({
      subject: d.category + (d.questionText.length > 20 ? '...' : ''), // Truncate for legend if needed
      fullQuestion: d.questionText,
      PM: d.pmAverageRating,
      Self: d.selfRating || 0
  }));

  // Show self assessment tab only if cycle is not closed AND self-assessment hasn't been submitted yet
  const canSubmitSelfAssessment = selectedCycle && 
    selectedCycle.status !== 'CLOSED' && 
    !selectedCycle.selfAssessmentSubmitted;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Performance Overview</h2>
        <div className="flex items-center gap-4">
          <Select value={selectedCycle?.id.toString()} onValueChange={handleCycleChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select cycle" />
            </SelectTrigger>
            <SelectContent>
              {allCycles.map(cycle => (
                <SelectItem key={cycle.id} value={cycle.id.toString()}>
                  {cycle.year} - <span className="text-muted-foreground">{cycle.status.replace(/_/g, ' ')}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge className={`${getStatusColor(selectedCycle?.status || '')} text-white`}>
            {selectedCycle?.status.replace(/_/g, ' ')}
          </Badge>
        </div>
      </div>

      {/* All Cycles Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Appraisal History</CardTitle>
          <CardDescription>All your past and ongoing appraisal cycles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCycles.map(cycle => (
                <TableRow key={cycle.id} className={selectedCycle?.id === cycle.id ? 'bg-muted/50' : ''}>
                  <TableCell className="font-medium">{cycle.year}</TableCell>
                  <TableCell>{cycle.startDate}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(cycle.status)} text-white`}>
                      {cycle.status.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant={selectedCycle?.id === cycle.id ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleCycleChange(cycle.id.toString())}
                    >
                      {selectedCycle?.id === cycle.id ? 'Viewing' : 'View Details'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedCycle && (
      <Tabs defaultValue="visuals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visuals">Visual Insights</TabsTrigger>
          {canSubmitSelfAssessment && <TabsTrigger value="assessment">Self Assessment</TabsTrigger>}
          <TabsTrigger value="feedback">Feedback & Replies</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visuals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Radar</CardTitle>
                <CardDescription>Comparison across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
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
                <CardTitle>Rating Comparison</CardTitle>
                <CardDescription>Side-by-side view</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="PM" fill="#2563eb" name="Manager Avg" />
                      <Bar dataKey="Self" fill="#14b8a6" name="Self Rating" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="assessment">
          <Card>
            <CardHeader>
              <CardTitle>Self Assessment</CardTitle>
              <CardDescription>Rate your performance and provide context.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {questions.map((q, index) => (
                  <div key={q.id} className="space-y-4 border-b pb-6 last:border-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded inline-block mb-2">{q.category}</span>
                            <p className="font-medium text-lg">{q.text}</p>
                        </div>
                        <div className="text-2xl font-bold text-primary pl-4">
                            {submissions[index]?.rating}/10
                        </div>
                    </div>
                    
                    <Slider
                      value={[submissions[index]?.rating || 5]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(val) => handleRatingChange(index, val)}
                      className="py-2"
                    />
                    
                    <Textarea
                      placeholder="My perspective on this..."
                      value={submissions[index]?.comment || ''}
                      onChange={(e) => handleCommentChange(index, e.target.value)}
                    />
                  </div>
                ))}
                
                <div className="flex justify-end pt-4">
                    <Button onClick={handleSubmitAssessment} size="lg">Submit Self Assessment</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="feedback">
            <Card>
                <CardHeader>
                    <CardTitle>Manager Feedback & Clarifications</CardTitle>
                    <CardDescription>Review comments and provide additional context if needed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {feedbackList.map((item) => (
                            <AccordionItem value={item.pmRatingId.toString()} key={item.pmRatingId}>
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4 text-left">
                                        <span className="font-medium">{item.questionText}</span>
                                        <Badge variant="outline" className="ml-2 whitespace-nowrap">
                                            Role: {item.rating}/10 by {item.pmName}
                                        </Badge>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4 px-1">
                                    <div className="bg-muted p-4 rounded-md">
                                        <p className="text-sm font-semibold mb-1">Manager's Comment:</p>
                                        <p className="italic text-muted-foreground">"{item.comment}"</p>
                                    </div>
                                    
                                    {item.existingClarification ? (
                                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-100 dark:border-blue-900">
                                            <p className="text-sm font-semibold mb-1 text-blue-700 dark:text-blue-300">Your Reply:</p>
                                            <p className="text-blue-600 dark:text-blue-400">{item.existingClarification}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Reply / Clarification</label>
                                            <Textarea 
                                                placeholder="Write your reply handling objection or providing context..." 
                                                value={replyText[item.pmRatingId] || ''}
                                                onChange={(e) => handleReplyChange(item.pmRatingId, e.target.value)}
                                            />
                                            <Button size="sm" onClick={() => submitReply(item.pmRatingId)}>Send Reply</Button>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    {feedbackList.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No specific feedback comments available to review yet.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}
