import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                About CyberLearn
              </h1>
              <p className="text-xl text-muted-foreground">
                Empowering the next generation of cybersecurity professionals with world-class training and certification programs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
                <p className="text-muted-foreground mb-6">
                  To democratize cybersecurity education and make high-quality training accessible to everyone. 
                  We believe that a more secure digital world starts with proper education and training.
                </p>
                
                <h3 className="text-xl font-semibold text-foreground mb-3">What We Offer</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Expert-designed curriculum</li>
                  <li>• Hands-on practical exercises</li>
                  <li>• Industry-recognized certifications</li>
                  <li>• 24/7 learning support</li>
                  <li>• Real-world case studies</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Why Choose Us</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-card rounded-lg border">
                    <h4 className="font-semibold text-foreground mb-2">Industry Experts</h4>
                    <p className="text-muted-foreground text-sm">
                      Learn from cybersecurity professionals with decades of real-world experience.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-card rounded-lg border">
                    <h4 className="font-semibold text-foreground mb-2">Practical Focus</h4>
                    <p className="text-muted-foreground text-sm">
                      Our courses emphasize hands-on learning with real scenarios and tools.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-card rounded-lg border">
                    <h4 className="font-semibold text-foreground mb-2">Career Support</h4>
                    <p className="text-muted-foreground text-sm">
                      Get guidance on career paths and job placement assistance after completion.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-hero rounded-2xl p-8 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Join Thousands of Successful Students</h2>
              <p className="text-xl mb-6 opacity-90">
                Over 10,000 students have advanced their careers through our programs
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div>
                  <div className="text-3xl font-bold text-accent mb-2">95%</div>
                  <div className="opacity-80">Job Placement Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent mb-2">4.8/5</div>
                  <div className="opacity-80">Average Rating</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent mb-2">50+</div>
                  <div className="opacity-80">Course Offerings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default About;