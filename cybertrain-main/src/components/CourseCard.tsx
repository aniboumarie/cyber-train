import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Matches the structure from backend CourseSerializer (and API response)
// Some fields might be optional if not always present in API response
export interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  image_url?: string; // Optional as it might be missing
  level: string;
  duration_display: string;
  enrolled_count: number;
  rating_avg: number;
  price_display: string;
  price_cents?: number; // Optional
  currency?: string;   // Optional
  tags?: string[];     // Optional
  instructor_name?: string; // Optional
  is_enrolled?: boolean;    // Optional, especially for unauthenticated views
}

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: string, courseTitle: string) => void; // Pass title for toast
}

const CourseCard = ({ course, onEnroll }: CourseCardProps) => {
  return (
    <Card className="group hover:shadow-elevated transition-smooth cursor-pointer bg-gradient-card flex flex-col h-full">
      <CardHeader className="flex-grow">
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={course.image_url || "/images/placeholder-course.jpg"} // Fallback image
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
        <CardDescription className="text-muted-foreground text-sm line-clamp-3">
          {/* line-clamp-3 to limit description lines */}
          {course.short_description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>⏱ {course.duration_display}</span>
          <span>👥 {course.enrolled_count} enrolled</span>
          <span>⭐ {course.rating_avg}/5</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">{course.price_display}</span>
          {/* Removed redundant level badge, already on image */}
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