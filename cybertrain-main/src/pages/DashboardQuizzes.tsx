import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const DashboardQuizzes = () => {
  const { toast } = useToast();
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);

  const availableQuizzes = [
    {
      id: 1,
      course: "Network Security Fundamentals",
      title: "Firewall Configuration Assessment",
      questions: 15,
      duration: "20 minutes",
      difficulty: "Intermediate",
      dueDate: "Tomorrow",
      status: "Available",
      attempts: 0,
      maxAttempts: 3
    },
    {
      id: 2,
      course: "Ethical Hacking & Penetration Testing",
      title: "SQL Injection Techniques Quiz",
      questions: 20,
      duration: "30 minutes",
      difficulty: "Advanced",
      dueDate: "In 3 days",
      status: "Available",
      attempts: 1,
      maxAttempts: 3
    },
    {
      id: 3,
      course: "Incident Response & Forensics",
      title: "Digital Evidence Collection",
      questions: 18,
      duration: "25 minutes",
      difficulty: "Advanced",
      dueDate: "In 1 week",
      status: "Locked",
      attempts: 0,
      maxAttempts: 3
    }
  ];

  const completedQuizzes = [
    {
      id: 4,
      course: "Cybersecurity Awareness Training",
      title: "Phishing Identification Quiz",
      score: 92,
      questions: 12,
      completedDate: "2 days ago",
      status: "Passed"
    },
    {
      id: 5,
      course: "Network Security Fundamentals",
      title: "Network Protocols Assessment",
      score: 88,
      questions: 15,
      completedDate: "1 week ago",
      status: "Passed"
    },
    {
      id: 6,
      course: "Cybersecurity Awareness Training",
      title: "Password Security Quiz",
      score: 95,
      questions: 10,
      completedDate: "2 weeks ago",
      status: "Passed"
    }
  ];

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return <Badge className="bg-green-500 text-white">Beginner</Badge>;
      case "Intermediate":
        return <Badge className="bg-yellow-500 text-white">Intermediate</Badge>;
      case "Advanced":
        return <Badge className="bg-red-500 text-white">Advanced</Badge>;
      default:
        return <Badge variant="outline">{difficulty}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <Badge className="bg-blue-500 text-white">Available</Badge>;
      case "Locked":
        return <Badge variant="outline">Locked</Badge>;
      case "Passed":
        return <Badge className="bg-green-500 text-white">Passed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStartQuiz = (quizId: number, title: string) => {
    toast({
      title: "Quiz Started!",
      description: `Starting "${title}". Good luck!`,
    });
    setSelectedQuiz(quizId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Quizzes & Assessments</h2>
          <p className="text-muted-foreground">Test your knowledge and track your learning progress</p>
        </div>

        {/* Quiz Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-primary">3</CardTitle>
              <CardDescription>Available Quizzes</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-green-600">3</CardTitle>
              <CardDescription>Completed Quizzes</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-accent">92%</CardTitle>
              <CardDescription>Average Score</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-primary">100%</CardTitle>
              <CardDescription>Pass Rate</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Available Quizzes */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Available Quizzes</CardTitle>
            <CardDescription>Complete these assessments to test your knowledge</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableQuizzes.map((quiz) => (
              <div key={quiz.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-smooth">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-foreground">{quiz.title}</h4>
                      {getDifficultyBadge(quiz.difficulty)}
                      {getStatusBadge(quiz.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{quiz.course}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>📝 {quiz.questions} questions</span>
                      <span>⏱ {quiz.duration}</span>
                      <span>📅 Due {quiz.dueDate}</span>
                      <span>🔄 {quiz.attempts}/{quiz.maxAttempts} attempts</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {quiz.status === "Available" ? (
                      <Button 
                        variant="hero"
                        onClick={() => handleStartQuiz(quiz.id, quiz.title)}
                      >
                        Start Quiz
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        Locked
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Completed Quizzes */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Completed Quizzes</CardTitle>
            <CardDescription>Review your past quiz results and achievements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedQuizzes.map((quiz) => (
              <div key={quiz.id} className="p-4 border rounded-lg">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-foreground">{quiz.title}</h4>
                      {getStatusBadge(quiz.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{quiz.course}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>📊 Score: {quiz.score}%</span>
                      <span>📝 {quiz.questions} questions</span>
                      <span>📅 Completed {quiz.completedDate}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${quiz.score >= 90 ? 'text-green-600' : quiz.score >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {quiz.score}%
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Results
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Study Tips */}
        <Card className="shadow-card bg-gradient-hero text-white">
          <CardHeader>
            <CardTitle>Quiz Tips & Study Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Before Taking a Quiz:</h4>
                <ul className="space-y-2 text-sm opacity-90">
                  <li>• Review course materials thoroughly</li>
                  <li>• Practice with flashcards and notes</li>
                  <li>• Ensure stable internet connection</li>
                  <li>• Find a quiet, distraction-free environment</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">During the Quiz:</h4>
                <ul className="space-y-2 text-sm opacity-90">
                  <li>• Read questions carefully</li>
                  <li>• Manage your time effectively</li>
                  <li>• Answer easier questions first</li>
                  <li>• Review answers before submitting</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardQuizzes;