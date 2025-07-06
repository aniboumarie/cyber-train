import { useState, useEffect, useCallback } from "react";
import CourseCard, { Course } from "./CourseCard"; // Import Course interface
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button"; // For pagination buttons
import { Loader2 } from 'lucide-react'; // For loading spinner
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define structure for paginated API response
interface PaginatedCoursesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Course[];
}

const CourseCatalog = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState(""); // For future search input

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);
  const [totalCourses, setTotalCourses] = useState(0);

  const { toast } = useToast();

  const fetchCourses = useCallback(async (page = 1, filter = "All", search = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      if (filter !== "All") {
        params.append("level", filter);
      }
      if (search) {
        params.append("search", search);
      }
      // params.append("page_size", "6"); // Already set in backend pagination

      const response = await fetch(`/api/courses/?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.statusText}`);
      }
      const data: PaginatedCoursesResponse = await response.json();

      setCourses(data.results);
      setNextPageUrl(data.next);
      setPrevPageUrl(data.previous);
      setTotalCourses(data.count);
      // Calculate total pages based on count and page_size (assuming page_size is known or consistent)
      // For now, if backend's page_size is 6 (as in StandardResultsSetPagination)
      setTotalPages(Math.ceil(data.count / 6));
      setCurrentPage(page);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Error fetching courses:", err);
      setCourses([]); // Clear courses on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses(currentPage, activeFilter, searchTerm);
  }, [fetchCourses, currentPage, activeFilter, searchTerm]);

  const handleEnroll = (courseId: string, courseTitle: string) => {
    // Placeholder: Actual enrollment would involve an API call
    console.log(`Attempting to enroll in course ID: ${courseId} (${courseTitle})`);
    toast({
      title: "Enrollment Action",
      description: `Enrollment process for "${courseTitle}" would start here. (This is a placeholder).`,
      // variant: "success" // Or appropriate variant
    });
    // Example API call (to be implemented later):
    // try {
    //   const token = localStorage.getItem("accessToken");
    //   const response = await fetch(`/api/enroll/${courseId}/`, {
    //     method: 'POST',
    //     headers: { 'Authorization': `Bearer ${token}` }
    //   });
    //   if (!response.ok) throw new Error('Enrollment failed');
    //   toast({ title: "Successfully enrolled!", description: `You are now enrolled in ${courseTitle}.`});
    //   // Optionally refetch user data or course data to reflect enrollment status
    // } catch (error) {
    //   toast({ title: "Enrollment failed", description: error.message, variant: "destructive" });
    // }
  };

  const handleFilterChange = (newFilter: string) => {
    setActiveFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filter changes
    // fetchCourses will be called by useEffect
  };

  // const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchTerm(event.target.value);
  //   setCurrentPage(1); // Reset to first page on new search
  // };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        // fetchCourses will be called by useEffect
    }
  };


  const filterOptions = ["All", "Beginner", "Intermediate", "Advanced"];

  return (
    <section id="courses" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Explore Our Courses
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our comprehensive library of cybersecurity courses designed by industry experts.
          </p>
        </div>

        {/* TODO: Add Search Input here later if desired */}
        {/* <div className="mb-8 max-w-md mx-auto">
          <Input
            type="search"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div> */}

        {/* Filter Buttons */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option}
                variant={activeFilter === option ? "default" : "secondary"}
                onClick={() => handleFilterChange(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg">Loading courses...</p>
          </div>
        )}

        {!isLoading && error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto my-8">
            <AlertTitle>Error Loading Courses</AlertTitle>
            <AlertDescription>{error} Please try again later.</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && courses.length === 0 && (
          <div className="text-center text-muted-foreground py-16">
            <h3 className="text-2xl font-semibold mb-2">No Courses Found</h3>
            <p>Try adjusting your filters or check back later for new courses.</p>
          </div>
        )}

        {!isLoading && !error && courses.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={handleEnroll}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-12 space-x-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!prevPageUrl || currentPage === 1}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-muted-foreground">
                Page {currentPage} of {totalPages} ({totalCourses} courses)
              </span>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!nextPageUrl || currentPage === totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CourseCatalog;