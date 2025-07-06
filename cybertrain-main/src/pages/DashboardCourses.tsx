import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom"; // For navigation
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';

// Interfaces for the API response structure
interface EnrolledCourseData {
  course_id: string;
  enrollment_id: string;
  title: string;
  slug: string;
  short_description?: string;
  image_url?: string;
  instructor_name?: string;
  progress_percentage: number;
  total_lessons_count: number;
  completed_lessons_count: number;
  next_lesson_title?: string | null;
  next_lesson_slug?: string | null;
  status: "Not Started" | "In Progress" | "Completed";
  user_time_spent_display?: string;
  estimated_time_remaining_display?: string;
  course_player_url?: string;
  course_details_url?: string;
  certificate_url?: string | null;
  review_course_url?: string | null;
}

interface SummaryStatsData {
  total_enrolled_courses: number;
  average_progress_percentage: number;
  total_hours_learned: number;
}

interface PaginationData {
    count: number;
    next: string | null;
    previous: string | null;
    page_size: number;
    current_page: number;
    total_pages: number;
}

interface UserEnrolledCoursesResponse {
  summary_stats: SummaryStatsData;
  pagination: PaginationData;
  results: EnrolledCourseData[];
}

const DashboardCourses = () => {
  const [enrolledCoursesData, setEnrolledCoursesData] = useState<UserEnrolledCoursesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchEnrolledCourses = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("User not authenticated. Please log in.");
        setIsLoading(false);
        // Potentially redirect to login: window.location.href = '/login';
        return;
      }

      const response = await fetch(`/api/users/me/enrolled-courses/?page=${page}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired or invalid. Please log in again.");
          // Potentially redirect to login
        } else {
          throw new Error(`Failed to fetch enrolled courses: ${response.statusText}`);
        }
      }
      const data: UserEnrolledCoursesResponse = await response.json();
      setEnrolledCoursesData(data);
      setCurrentPage(data.pagination.current_page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error fetching enrolled courses:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrolledCourses(currentPage);
  }, [fetchEnrolledCourses, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (enrolledCoursesData && newPage >= 1 && newPage <= enrolledCoursesData.pagination.total_pages) {
        setCurrentPage(newPage);
    }
  };

  const getStatusBadge = (status: "Not Started" | "In Progress" | "Completed") => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Completed</Badge>;
      case "In Progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "Not Started":
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Loading your courses...</p>
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

  if (!enrolledCoursesData || enrolledCoursesData.results.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">My Courses</h2>
                <p className="text-muted-foreground">Track your progress and continue learning</p>
            </div>
            <div className="text-center text-muted-foreground py-16">
                <h3 className="text-2xl font-semibold mb-2">No Courses Enrolled Yet</h3>
                <p className="mb-6">Start your learning journey by exploring our catalog.</p>
                <Button asChild variant="hero" size="lg">
                    <Link to="/courses">Browse All Courses</Link>
                </Button>
            </div>
        </div>
      </DashboardLayout>
    );
  }

  const { summary_stats, results: courses, pagination } = enrolledCoursesData;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">My Courses</h2>
          <p className="text-muted-foreground">Track your progress and continue learning</p>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-primary">{summary_stats.total_enrolled_courses}</CardTitle>
              <CardDescription>Enrolled Courses</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-accent">{summary_stats.average_progress_percentage}%</CardTitle>
              <CardDescription>Average Progress</CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-primary">{summary_stats.total_hours_learned}</CardTitle>
              <CardDescription>Hours Learned</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Enrolled Courses List */}
        <div className="space-y-6">
          {courses.map((course) => (
            <Card key={course.enrollment_id} className="shadow-card hover:shadow-elevated transition-smooth">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-48 lg:h-32 w-full h-48 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={course.image_url || "/images/placeholder-course.jpg"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-foreground hover:text-primary transition-smooth">
                            <Link to={course.course_details_url || `/courses/${course.slug}`}>{course.title}</Link>
                        </h3>
                        {getStatusBadge(course.status)}
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">{course.short_description}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Progress: {course.completed_lessons_count}/{course.total_lessons_count} lessons</span>
                        <span className="text-muted-foreground">{course.progress_percentage}%</span>
                      </div>
                      <Progress value={course.progress_percentage} className="h-2" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Time Spent:</span>
                        <div className="font-medium">{course.user_time_spent_display || "N/A"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Next Lesson:</span>
                        <div className="font-medium truncate" title={course.next_lesson_title || "N/A"}>{course.next_lesson_title || "N/A"}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Remaining:</span>
                        <div className="font-medium">{course.estimated_time_remaining_display || "N/A"}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-2">
                      {course.status === "Completed" ? (
                        <>
                          {course.certificate_url && (
                            <Button asChild variant="outline">
                                <Link to={course.certificate_url}>View Certificate</Link>
                            </Button>
                          )}
                           <Button asChild variant="secondary">
                                <Link to={course.review_course_url || `/courses/${course.slug}/review`}>Review Course</Link>
                           </Button>
                        </>
                      ) : (
                        <>
                          <Button asChild variant="hero">
                            <Link to={course.course_player_url || `/courses/${course.slug}/player/${course.next_lesson_slug || ''}`}>Continue Learning</Link>
                          </Button>
                          <Button asChild variant="outline">
                            <Link to={course.course_details_url || `/courses/${course.slug}`}>Course Details</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.total_pages > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-2">
                <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.previous}
                    variant="outline"
                >
                    Previous
                </Button>
                <span className="text-muted-foreground">
                    Page {currentPage} of {pagination.total_pages}
                </span>
                <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.next}
                    variant="outline"
                >
                    Next
                </Button>
            </div>
        )}

        {/* Browse More Courses Card - remains as is */}
        <Card className="shadow-card text-center">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-foreground mb-2">Ready for More?</h3>
            <p className="text-muted-foreground mb-4">
              Explore our full catalog of cybersecurity courses to continue expanding your skills.
            </p>
            <Button asChild variant="hero" size="lg">
                <Link to="/courses">Browse All Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardCourses;