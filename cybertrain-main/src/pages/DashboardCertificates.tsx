import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Download, Share2 } from "lucide-react";

const DashboardCertificates = () => {
  const certificates = [
    {
      title: "Ethical Hacking & Penetration Testing",
      issueDate: "2024-01-15",
      certificateId: "CERT-EH-2024-001",
      status: "Issued",
      creditsEarned: 40
    }
  ];

  const availableCertificates = [
    {
      title: "Network Security Fundamentals",
      progress: 75,
      required: 80,
      creditsRequired: 35
    },
    {
      title: "Cybersecurity Awareness Training",
      progress: 45,
      required: 80,
      creditsRequired: 25
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Certificates</h1>
          <p className="text-muted-foreground">View and manage your earned certificates</p>
        </div>

        {/* Earned Certificates */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Earned Certificates</h2>
          {certificates.length > 0 ? (
            <div className="grid gap-4">
              {certificates.map((cert, index) => (
                <Card key={index} className="border-emerald-200 bg-emerald-50/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{cert.title}</CardTitle>
                          <CardDescription>
                            Certificate ID: {cert.certificateId}
                          </CardDescription>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                            <span>Credits: {cert.creditsEarned}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-emerald-600">
                        {cert.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No certificates earned yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete courses to earn certificates
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Available Certificates */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Available Certificates</h2>
          <div className="grid gap-4">
            {availableCertificates.map((cert, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{cert.title}</CardTitle>
                      <CardDescription>
                        {cert.creditsRequired} credits required • Complete {cert.required}% to earn
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {cert.progress}% Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(cert.progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {cert.progress >= cert.required 
                      ? "Eligible for certificate! Complete final assessment." 
                      : `${cert.required - cert.progress}% more needed to earn certificate`
                    }
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardCertificates;