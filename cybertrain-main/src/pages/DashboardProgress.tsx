import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const DashboardProgress = () => {
  const courses = [
    {
      title: "Network Security Fundamentals",
      progress: 75,
      completed: 3,
      total: 4,
      status: "In Progress"
    },
    {
      title: "Ethical Hacking & Penetration Testing",
      progress: 100,
      completed: 5,
      total: 5,
      status: "Completed"
    },
    {
      title: "Cybersecurity Awareness Training",
      progress: 45,
      completed: 2,
      total: 4,
      status: "In Progress"
    }
  ];

  const overallProgress = Math.round(courses.reduce((acc, course) => acc + course.progress, 0) / courses.length);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Learning Progress</h1>
          <p className="text-muted-foreground">Track your learning journey and achievements</p>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>Your progress across all enrolled courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm text-muted-foreground">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="w-full" />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">3</div>
                  <div className="text-sm text-muted-foreground">Courses Enrolled</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">1</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">2</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Progress */}
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold text-foreground">Course Progress</h2>
          {courses.map((course, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>
                      {course.completed} of {course.total} modules completed
                    </CardDescription>
                  </div>
                  <Badge variant={course.status === "Completed" ? "default" : "secondary"}>
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardProgress;