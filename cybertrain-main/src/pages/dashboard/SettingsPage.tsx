import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SettingsPage = () => {
  const { toast } = useToast();
  const [passwordFormData, setPasswordFormData] = useState({
    old_password: "",
    new_password1: "",
    new_password2: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);


  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);

    if (passwordFormData.new_password1 !== passwordFormData.new_password2) {
      setPasswordChangeError("New passwords do not match.");
      setIsSavingPassword(false);
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setPasswordChangeError("User not authenticated. Please log in.");
        setIsSavingPassword(false);
        return;
      }

      const response = await fetch("/api/auth/password/change/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            old_password: passwordFormData.old_password,
            new_password1: passwordFormData.new_password1,
            new_password2: passwordFormData.new_password2,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle errors from backend (e.g., incorrect old password, weak new password)
        let errorMessage = "Failed to change password.";
        if (responseData && typeof responseData === 'object') {
            const errors = Object.values(responseData).flat(); // Get all error messages
            if (errors.length > 0) {
                errorMessage = errors.join(" ");
            }
        }
        throw new Error(errorMessage);
      }

      setPasswordChangeSuccess("Password changed successfully!");
      toast({
        title: "Success",
        description: "Your password has been changed successfully.",
      });
      setPasswordFormData({ old_password: "", new_password1: "", new_password2: "" }); // Reset form

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setPasswordChangeError(errorMessage);
      toast({
        title: "Password Change Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };


  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account security and preferences.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Choose a strong password and don't reuse it for other accounts.</CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordChangeSubmit}>
            <CardContent className="space-y-6">
              {passwordChangeError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{passwordChangeError}</AlertDescription>
                </Alert>
              )}
              {passwordChangeSuccess && (
                <Alert variant="default" className="bg-green-100 border-green-300 text-green-700">
                   <AlertTitle>Success</AlertTitle>
                   <AlertDescription>{passwordChangeSuccess}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="old_password">Current Password</Label>
                <Input
                  id="old_password"
                  name="old_password"
                  type="password"
                  value={passwordFormData.old_password}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password1">New Password</Label>
                <Input
                  id="new_password1"
                  name="new_password1"
                  type="password"
                  value={passwordFormData.new_password1}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password2">Confirm New Password</Label>
                <Input
                  id="new_password2"
                  name="new_password2"
                  type="password"
                  value={passwordFormData.new_password2}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSavingPassword}>
                {isSavingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSavingPassword ? "Changing Password..." : "Change Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
                <CardDescription>Add an extra layer of security to your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Two-factor authentication (2FA) settings will be available here in a future update.
                </p>
                {/* 2FA Settings UI will go here */}
            </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
