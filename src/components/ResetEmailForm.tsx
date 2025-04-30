
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resetSpecificEmail } from '@/utils/authUtils';

interface ResetEmailFormProps {
  onClose: () => void;
}

const ResetEmailForm: React.FC<ResetEmailFormProps> = ({ onClose }) => {
  const [email, setEmail] = useState("kmagessa@gitam.in"); // Pre-filled with the requested email
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await resetSpecificEmail(email, password);
      
      if (success) {
        toast({
          title: "Email Reset Successful",
          description: `${email} can now login and vote again.`,
        });
        onClose();
      } else {
        setError("Failed to reset email. Please check your password.");
        toast({
          title: "Reset Failed",
          description: "Please ensure you've entered the correct admin password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resetting email:", error);
      setError("An unexpected error occurred. Please try again.");
      toast({
        title: "Error",
        description: "An unexpected error occurred while processing your request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Specific Email</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email to Reset</label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to reset"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Admin Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Reset Email"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResetEmailForm;
