import { Button } from "@/components/ui/button";
import heroImage from "@/assets/cyber-hero.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Master <span className="text-accent">Cybersecurity</span>
          <br />
          Skills That Matter
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
          Learn from industry experts through hands-on cybersecurity courses. 
          Protect your organization and advance your career with real-world skills.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="hero" size="lg" className="text-lg px-8 py-6">
            Start Learning Today
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
            Browse Courses
          </Button>
        </div>
        
        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">50+</div>
            <div className="text-white/80">Expert-Led Courses</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">10K+</div>
            <div className="text-white/80">Students Trained</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent mb-2">95%</div>
            <div className="text-white/80">Success Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;