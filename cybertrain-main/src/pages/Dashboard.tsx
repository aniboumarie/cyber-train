import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For error display
import { Loader2 } from 'lucide-react'; // For loading spinner

// Define interfaces for the expected data structure from the backend
interface UserStats {
  enrolled_courses_count: number;
  average_progress_percentage: number;
  certificates_earned_count: number;
  hours_learned: number;
}

interface Lesson {
  id: string;
  title: string;
}

interface EnrolledCourse {
  id: string;
  title: string;
  progress_percentage: number;
  next_lesson: Lesson | null;
  time_left_estimate: string;
}

interface UpcomingQuiz {
  id: string;
  course_title: string;
  course_id: string;
  due_date: string; // ISO string, will need formatting
  questions_count: number;
  quiz_url?: string; // Optional URL to start the quiz
}

interface RecentActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string; // ISO string, will need formatting
  related_item?: {
    type: string;
    id: string;
    title: string;
  };
}

interface DashboardData {
  user_name: string;
  stats: UserStats;
  enrolled_courses: EnrolledCourse[];
  upcoming_quizzes: UpcomingQuiz[];
  recent_activity: RecentActivityItem[];
}

// Helper to format date strings (simple version)
const formatDate = (isoString: string | undefined, options?: Intl.DateTimeFormatOptions) => {
  if (!isoString) return "N/A";
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'long', day: 'numeric',
    // hour: '2-digit', minute: '2-digit'
  };
  try {
    return new Date(isoString).toLocaleDateString(undefined, options || defaultOptions);
  } catch (e) {
    return "Invalid Date";
  }
};

// Helper to format time since (very basic)
const formatTimeSince = (isoString: string | undefined) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
};


// Helper for activity icons (can be expanded)
const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case "course_completion":
    case "lesson_completed":
      return <span className="text-white text-xs">✓</span>;
    case "certificate_earned":
      return <span className="text-white text-xs">🏆</span>;
    case "course_enrollment":
    case "course_started":
      return <span className="text-white text-xs">📚</span>;
    case "quiz_passed":
    case "quiz_attempted":
      return <span className="text-white text-xs">🎯</span>;
    default:
      return <span className="text-white text-xs">⭐</span>;
  }
};
const getActivityIconBg = (activityType: string) => {
    switch (activityType) {
      case "course_completion":
      case "lesson_completed":
        return "bg-green-500";
      case "certificate_earned":
        return "bg-blue-500";
      case "course_enrollment":
      case "course_started":
        return "bg-purple-500";
      case "quiz_passed":
      case "quiz_attempted":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };


const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Placeholder for token retrieval
        const token = localStorage.getItem("accessToken");
        if (!token) {
          // Handle unauthenticated state e.g. redirect to login
          // For now, just set an error or let it fail gracefully if API requires auth
          setError("User not authenticated. Please log in.");
          setIsLoading(false);
          // You might want to redirect to login page here
          // window.location.href = '/login';
          return;
        }

        const response = await fetch("/api/dashboard/overview/", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Handle token expiry or invalid token, e.g., redirect to login
            setError("Session expired or invalid. Please log in again.");
            // window.location.href = '/login'; // Or trigger a logout function
          } else {
            throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
          }
        }

        const data: DashboardData = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground py-8">
            <p>No dashboard data available.</p>
        </div>
      </DashboardLayout>
    );
  }

  const { user_name, stats, enrolled_courses, upcoming_quizzes, recent_activity } = dashboardData;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user_name || "User"}!</h2>
          <p className="text-muted-foreground">Continue your cybersecurity learning journey.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-primary">{stats.enrolled_courses_count}</CardTitle>
              <CardDescription>Enrolled Courses</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-accent">{stats.average_progress_percentage}%</CardTitle>
              <CardDescription>Average Progress</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-primary">{stats.certificates_earned_count}</CardTitle>
              <CardDescription>Certificates Earned</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-accent">{stats.hours_learned}</CardTitle>
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
              {enrolled_courses && enrolled_courses.length > 0 ? (
                enrolled_courses.map((course) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-sm">{course.title}</h4>
                      <span className="text-sm text-muted-foreground">{course.progress_percentage}%</span>
                    </div>
                    <Progress value={course.progress_percentage} className="h-2" />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Next: {course.next_lesson?.title || "N/A"}</span>
                      <span>{course.time_left_estimate}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No courses enrolled yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Quizzes */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Upcoming Quizzes</CardTitle>
              <CardDescription>Don't forget to complete these assessments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcoming_quizzes && upcoming_quizzes.length > 0 ? (
                upcoming_quizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">{quiz.course_title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {quiz.questions_count} questions • Due {formatDate(quiz.due_date, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" disabled={!quiz.quiz_url} onClick={() => quiz.quiz_url && (window.location.href = quiz.quiz_url)}>
                      Start Quiz
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No upcoming quizzes.</p>
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
            {recent_activity && recent_activity.length > 0 ? (
              <div className="space-y-4">
                {recent_activity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                    <div className={`w-8 h-8 ${getActivityIconBg(activity.type)} rounded-full flex items-center justify-center`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeSince(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                  <p>No recent activity to display.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;