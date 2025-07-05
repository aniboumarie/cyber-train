import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import networkSecurityImg from "@/assets/course-network-security.jpg";
import ethicalHackingImg from "@/assets/course-ethical-hacking.jpg";
import awarenessImg from "@/assets/course-awareness.jpg";

const DashboardCourses = () => {
  const enrolledCourses = [
    {
      id: 1,
      title: "Network Security Fundamentals",
      description: "Learn the basics of network security, including firewalls, VPNs, and intrusion detection systems.",
      image: networkSecurityImg,
      progress: 75,
      totalLessons: 20,
      completedLessons: 15,
      nextLesson: "Firewall Configuration",
      status: "In Progress",
      timeSpent: "12 hours",
      estimatedTime: "4 hours remaining"
    },
    {
      id: 2,
      title: "Ethical Hacking & Penetration Testing",
      description: "Master ethical hacking techniques and learn how to conduct professional penetration tests.",
      image: ethicalHackingImg,
      progress: 30,
      totalLessons: 25,
      completedLessons: 8,
      nextLesson: "SQL Injection Techniques",
      status: "In Progress",
      timeSpent: "8 hours",
      estimatedTime: "18 hours remaining"
    },
    {
      id: 3,
      title: "Cybersecurity Awareness Training",
      description: "Essential cybersecurity awareness for employees and teams to prevent common attacks.",
      image: awarenessImg,
      progress: 100,
      totalLessons: 12,
      completedLessons: 12,
      nextLesson: "Course Completed!",
      status: "Completed",
      timeSpent: "6 hours",
      estimatedTime: "Certificate earned"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case "In Progress":
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

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
              <CardTitle className="text-2xl font-bold text-primary">26</CardTitle>
              <CardDescription>Hours Learned</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Enrolled Courses */}
        <div className="space-y-6">
          {enrolledCourses.map((course) => (
            <Card key={course.id} className="shadow-card hover:shadow-elevated transition-smooth">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Course Image */}
                  <div className="lg:w-48 lg:h-32 w-full h-48 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Course Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-foreground">{course.title}</h3>
                          {getStatusBadge(course.status)}
                        </div>
                        <p className="text-muted-foreground text-sm">{course.description}</p>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Progress: {course.completedLessons}/{course.totalLessons} lessons</span>
                        <span className="text-muted-foreground">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    {/* Course Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Time Spent:</span>
                        <div className="font-medium">{course.timeSpent}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Next Lesson:</span>
                        <div className="font-medium">{course.nextLesson}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Remaining:</span>
                        <div className="font-medium">{course.estimatedTime}</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      {course.status === "Completed" ? (
                        <>
                          <Button variant="outline">
                            View Certificate
                          </Button>
                          <Button variant="secondary">
                            Review Course
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="hero">
                            Continue Learning
                          </Button>
                          <Button variant="outline">
                            Course Details
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

        {/* Browse More Courses */}
        <Card className="shadow-card text-center">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-foreground mb-2">Ready for More?</h3>
            <p className="text-muted-foreground mb-4">
              Explore our full catalog of cybersecurity courses to continue expanding your skills.
            </p>
            <Button variant="hero" size="lg">
              Browse All Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardCourses;