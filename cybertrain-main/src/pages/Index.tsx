import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CourseCatalog from "@/components/CourseCatalog";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <CourseCatalog />
      <Footer />
    </div>
  );
};

export default Index;
