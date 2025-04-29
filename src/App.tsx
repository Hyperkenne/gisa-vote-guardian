
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getCurrentEmail } from "./utils/authUtils";
import Index from "./pages/Index";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";
import React from "react";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = getCurrentEmail() !== null;
  const location = useLocation();

  if (!isAuthenticated && location.pathname === '/results') {
    return <Navigate to="/vote" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/vote" element={<Vote />} />
            <Route 
              path="/results" 
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <footer className="bg-gray-900 text-white py-6">
          <div className="election-container text-center">
            <p>© 2025 GISA Elections. All rights reserved.</p>
            <p className="text-sm text-gray-400 mt-2">
              Secured with device fingerprinting technology
            </p>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
