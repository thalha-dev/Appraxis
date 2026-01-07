import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";

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

export default function EmployeeDashboard() {
  const { toast } = useToast();
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<SelfRatingSubmission[]>([]);

  useEffect(() => {
    fetchActiveCycle();
  }, []);

  useEffect(() => {
    if (activeCycle) {
      fetchReport();
      fetchQuestions();
    }
  }, [activeCycle]);

  const fetchActiveCycle = async () => {
    try {
      const response = await api.get('/employee/active-cycle');
      setActiveCycle(response.data);
    } catch (error) {
      console.error("Failed to fetch active cycle", error);
    }
  };

  const fetchReport = async () => {
    try {
      const response = await api.get(`/employee/report/${activeCycle.id}`);
      setReportData(response.data);
    } catch (error) {
      console.error("Failed to fetch report", error);
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
    if (!activeCycle) return;
    try {
      await api.post(`/employee/self-assessment/${activeCycle.id}`, submissions);
      toast({
        title: "Assessment Submitted",
        description: "Your self-assessment has been saved.",
      });
      fetchReport(); // Refresh graphs
    } catch (error) {
      console.error("Failed to submit assessment", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Please try again later.",
      });
    }
  };

  if (!activeCycle) {
      return (
          <div className="flex items-center justify-center h-full pt-10">
              <Card>
                  <CardContent className="pt-6">
                      <p className="text-muted-foreground">No active appraisal cycle found for the current year.</p>
                  </CardContent>
              </Card>
          </div>
      )
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Performance Overview</h2>
        <div className="text-sm text-muted-foreground">Cycle: {activeCycle.year}</div>
      </div>

      <Tabs defaultValue="visuals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visuals">Visual Insights</TabsTrigger>
          <TabsTrigger value="assessment">Self Assessment</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
