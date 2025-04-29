
import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAuthorizedEmail, authenticateEmail, isEmailAuthenticated } from '@/utils/authUtils';
import { Mail } from 'lucide-react';

const formSchema = z.object({
  email: z.string()
    .email("Please enter a valid email")
    .refine((email) => isAuthorizedEmail(email), {
      message: "This email is not authorized to vote",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      // Check if email has already authenticated
      const alreadyAuthenticated = await isEmailAuthenticated(values.email);
      
      if (alreadyAuthenticated) {
        toast({
          title: "Authentication failed",
          description: "This email has already been used for voting",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Authenticate the email
      const success = await authenticateEmail(values.email);
      
      if (success) {
        toast({
          title: "Authentication successful",
          description: "You can now proceed to vote",
        });
        onSuccess();
      } else {
        toast({
          title: "Authentication failed",
          description: "Please check your email and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Authentication error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">GISA Elections</CardTitle>
        <CardDescription>
          Please enter your email to authenticate. You can only vote once with each email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Enter your email"
                        className="pl-10"
                        {...field}
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Login to Vote"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-xs text-gray-500 text-center">
          Only authorized voters with @student.gitam.edu or @gitam.in email addresses can participate.
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
