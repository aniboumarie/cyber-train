import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCatalog from "@/components/CourseCatalog";

const Courses = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Cybersecurity Courses
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive cybersecurity training designed by industry experts. 
              From beginner-friendly introductions to advanced professional certifications.
            </p>
          </div>

          {/* Course Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center p-6 bg-gradient-card rounded-lg border shadow-card">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Active Courses</div>
            </div>
            <div className="text-center p-6 bg-gradient-card rounded-lg border shadow-card">
              <div className="text-3xl font-bold text-primary mb-2">15</div>
              <div className="text-muted-foreground">Specializations</div>
            </div>
            <div className="text-center p-6 bg-gradient-card rounded-lg border shadow-card">
              <div className="text-3xl font-bold text-primary mb-2">200+</div>
              <div className="text-muted-foreground">Hours of Content</div>
            </div>
            <div className="text-center p-6 bg-gradient-card rounded-lg border shadow-card">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Learning Support</div>
            </div>
          </div>
          
          <CourseCatalog />
          
          {/* Learning Paths */}
          <section className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Structured Learning Paths
              </h2>
              <p className="text-xl text-muted-foreground">
                Follow our expertly designed learning paths to achieve your career goals
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 bg-gradient-card rounded-lg border shadow-card">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Security Fundamentals</h3>
                <p className="text-muted-foreground mb-4">
                  Perfect for beginners. Learn the basics of cybersecurity, risk management, and security frameworks.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Cybersecurity Awareness</li>
                  <li>• Network Security Basics</li>
                  <li>• Risk Assessment</li>
                  <li>• Security Policies</li>
                </ul>
              </div>
              
              <div className="p-8 bg-gradient-card rounded-lg border shadow-card">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Penetration Testing</h3>
                <p className="text-muted-foreground mb-4">
                  Advanced track for ethical hacking and penetration testing professionals.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ethical Hacking Fundamentals</li>
                  <li>• Advanced Penetration Testing</li>
                  <li>• Vulnerability Assessment</li>
                  <li>• Security Tools Mastery</li>
                </ul>
              </div>
              
              <div className="p-8 bg-gradient-card rounded-lg border shadow-card">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-6">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Incident Response</h3>
                <p className="text-muted-foreground mb-4">
                  Specialized path for incident response and digital forensics experts.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Incident Response Planning</li>
                  <li>• Digital Forensics</li>
                  <li>• Threat Hunting</li>
                  <li>• Crisis Management</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Courses;