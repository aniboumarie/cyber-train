import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const enrolledCourses = [
    { 
      title: "Network Security Fundamentals", 
      progress: 75, 
      nextLesson: "Firewall Configuration",
      timeLeft: "2 hours"
    },
    { 
      title: "Ethical Hacking & Penetration Testing", 
      progress: 30, 
      nextLesson: "SQL Injection Techniques",
      timeLeft: "8 hours"
    },
    { 
      title: "Cybersecurity Awareness Training", 
      progress: 100, 
      nextLesson: "Course Completed!",
      timeLeft: "Complete"
    }
  ];

  const upcomingQuizzes = [
    { course: "Network Security Fundamentals", dueDate: "Tomorrow", questions: 15 },
    { course: "Incident Response & Forensics", dueDate: "In 3 days", questions: 20 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, John!</h2>
          <p className="text-muted-foreground">Continue your cybersecurity learning journey.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-primary">3</CardTitle>
              <CardDescription>Enrolled Courses</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-accent">68%</CardTitle>
              <CardDescription>Average Progress</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-primary">1</CardTitle>
              <CardDescription>Certificates Earned</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-accent">24</CardTitle>
              <CardDescription>Hours Learned</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Progress */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>Your current learning progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {enrolledCourses.map((course, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">{course.title}</h4>
                    <span className="text-sm text-muted-foreground">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Next: {course.nextLesson}</span>
                    <span>{course.timeLeft}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Quizzes */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Upcoming Quizzes</CardTitle>
              <CardDescription>Don't forget to complete these assessments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingQuizzes.map((quiz, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-sm">{quiz.course}</h4>
                    <p className="text-xs text-muted-foreground">{quiz.questions} questions • Due {quiz.dueDate}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Start Quiz
                  </Button>
                </div>
              ))}
              
              {upcomingQuizzes.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p>No upcoming quizzes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest learning achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Completed "Phishing Attack Prevention"</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🏆</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Earned "Security Awareness" Certificate</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">📚</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Started "Advanced Threat Detection"</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;