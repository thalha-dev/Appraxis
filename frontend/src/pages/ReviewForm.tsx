import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from 'react-router-dom';
import { Progress } from "@/components/ui/progress";

interface Question {
  id: number;
  text: string;
  category: string;
}

interface PmRating {
  questionId: number;
  rating: number;
  comment: string;
}

export default function ReviewForm() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [ratings, setRatings] = useState<PmRating[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/questions');
      const data = response.data;
      setQuestions(data);
      // Initialize ratings
      setRatings(data.map((q: Question) => ({
        questionId: q.id,
        rating: 5,
        comment: ''
      })));
    } catch (error) {
      console.error("Failed to fetch questions", error);
    }
  };

  const handleRatingChange = (value: number[]) => {
    if (!questions[currentStep]) return;
    const newRatings = [...ratings];
    newRatings[currentStep].rating = value[0];
    setRatings(newRatings);
  };

  const handleCommentChange = (value: string) => {
    if (!questions[currentStep]) return;
    const newRatings = [...ratings];
    newRatings[currentStep].comment = value;
    setRatings(newRatings);
  };

  const handleSubmit = async () => {
    try {
      await api.post(`/pm/reviews/${reviewId}/submit`, ratings);
      toast({
        title: "Review Submitted",
        description: "Your feedback has been recorded successfully.",
      });
      navigate('/pm-dashboard');
    } catch (error) {
      console.error("Failed to submit review", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Please try again later.",
      });
    }
  };
  
  const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;

  if (questions.length === 0) return <div>Loading...</div>;

  const currentQuestion = questions[currentStep];
  const currentRating = ratings[currentStep];

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Manager Review</h2>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground mt-2 text-right">Question {currentStep + 1} of {questions.length}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">{currentQuestion.category}</span>
          </div>
          <CardTitle className="text-xl leading-relaxed">{currentQuestion.text}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-medium">Rating</label>
              <span className="text-2xl font-bold text-primary">{currentRating?.rating}/10</span>
            </div>
            <Slider
              value={[currentRating?.rating || 5]}
              min={1}
              max={10}
              step={1}
              onValueChange={handleRatingChange}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="font-medium">Additional Comments (Optional)</label>
            <Textarea
              id="comment"
              placeholder="Provide specific examples or context..."
              value={currentRating?.comment || ''}
              onChange={(e) => handleCommentChange(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              {currentStep < questions.length - 1 ? (
                <Button onClick={() => setCurrentStep(prev => prev + 1)}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
                  Submit Review
                </Button>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
