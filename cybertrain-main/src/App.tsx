import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Courses from "./pages/Courses";
import Dashboard from "./pages/Dashboard";
import DashboardCourses from "./pages/DashboardCourses";
import DashboardQuizzes from "./pages/DashboardQuizzes";
import ProfilePage from "./pages/dashboard/ProfilePage"; // Added
import SettingsPage from "./pages/dashboard/SettingsPage"; // Added
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/courses" element={<DashboardCourses />} />
          <Route path="/dashboard/quizzes" element={<DashboardQuizzes />} />
          <Route path="/dashboard/profile" element={<ProfilePage />} /> {/* Added */}
          <Route path="/dashboard/settings" element={<SettingsPage />} /> {/* Added */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
