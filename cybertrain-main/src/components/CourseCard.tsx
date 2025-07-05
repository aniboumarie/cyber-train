import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  enrolled: number;
  rating: number;
  image: string;
  price: string;
}

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => void;
}

const CourseCard = ({ course, onEnroll }: CourseCardProps) => {
  return (
    <Card className="group hover:shadow-elevated transition-smooth cursor-pointer bg-gradient-card">
      <CardHeader>
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
          />
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
            {course.level}
          </Badge>
        </div>
        <CardTitle className="text-xl font-semibold group-hover:text-primary transition-smooth">
          {course.title}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {course.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>⏱ {course.duration}</span>
          <span>👥 {course.enrolled} enrolled</span>
          <span>⭐ {course.rating}/5</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">{course.price}</span>
          <Badge variant="secondary">{course.level}</Badge>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="hero" 
          className="w-full"
          onClick={() => onEnroll(course.id)}
        >
          Enroll Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;