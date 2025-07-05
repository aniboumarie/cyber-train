import { useState } from "react";
import CourseCard from "./CourseCard";
import { useToast } from "@/hooks/use-toast";
import networkSecurityImg from "@/assets/course-network-security.jpg";
import ethicalHackingImg from "@/assets/course-ethical-hacking.jpg";
import awarenessImg from "@/assets/course-awareness.jpg";

const courses = [
  {
    id: "1",
    title: "Network Security Fundamentals",
    description: "Learn the basics of network security, including firewalls, VPNs, and intrusion detection systems.",
    duration: "8 weeks",
    level: "Beginner",
    enrolled: 1247,
    rating: 4.8,
    image: networkSecurityImg,
    price: "$199"
  },
  {
    id: "2",
    title: "Ethical Hacking & Penetration Testing",
    description: "Master ethical hacking techniques and learn how to conduct professional penetration tests.",
    duration: "12 weeks",
    level: "Advanced",
    enrolled: 892,
    rating: 4.9,
    image: ethicalHackingImg,
    price: "$299"
  },
  {
    id: "3",
    title: "Cybersecurity Awareness Training",
    description: "Essential cybersecurity awareness for employees and teams to prevent common attacks.",
    duration: "4 weeks",
    level: "Beginner",
    enrolled: 2156,
    rating: 4.7,
    image: awarenessImg,
    price: "$99"
  },
  {
    id: "4",
    title: "Advanced Threat Detection",
    description: "Learn advanced techniques for detecting and responding to sophisticated cyber threats.",
    duration: "10 weeks",
    level: "Intermediate",
    enrolled: 567,
    rating: 4.6,
    image: networkSecurityImg,
    price: "$249"
  },
  {
    id: "5",
    title: "Incident Response & Forensics",
    description: "Master incident response procedures and digital forensics techniques.",
    duration: "14 weeks",
    level: "Advanced",
    enrolled: 334,
    rating: 4.8,
    image: ethicalHackingImg,
    price: "$349"
  },
  {
    id: "6",
    title: "Cloud Security Essentials",
    description: "Learn how to secure cloud environments and implement best practices for cloud security.",
    duration: "6 weeks",
    level: "Intermediate",
    enrolled: 723,
    rating: 4.5,
    image: awarenessImg,
    price: "$179"
  }
];

const CourseCatalog = () => {
  const [filter, setFilter] = useState("All");
  const { toast } = useToast();

  const handleEnroll = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    toast({
      title: "Enrollment Successful!",
      description: `You've been enrolled in "${course?.title}". Check your dashboard to start learning.`,
    });
  };

  const filteredCourses = filter === "All" 
    ? courses 
    : courses.filter(course => course.level === filter);

  const filterOptions = ["All", "Beginner", "Intermediate", "Advanced"];

  return (
    <section id="courses" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Cybersecurity Courses
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our comprehensive library of cybersecurity courses designed by industry experts.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-4 py-2 rounded-lg font-medium transition-smooth ${
                  filter === option
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseCatalog;