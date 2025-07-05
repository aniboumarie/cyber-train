import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-bold text-foreground">CyberLearn</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <a href="#courses" className="text-foreground hover:text-primary transition-smooth">
            Courses
          </a>
          <a href="#about" className="text-foreground hover:text-primary transition-smooth">
            About
          </a>
          <a href="#contact" className="text-foreground hover:text-primary transition-smooth">
            Contact
          </a>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="hero" onClick={() => navigate('/register')}>
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;