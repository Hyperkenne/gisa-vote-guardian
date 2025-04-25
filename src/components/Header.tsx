
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HomeIcon, CheckSquare, BarChart3 } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="election-container">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-election flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <h1 className="text-xl font-bold text-election-dark">GISA Elections</h1>
          </div>
          
          <nav className="flex items-center gap-2 md:gap-4">
            <Link to="/">
              <Button 
                variant={isActive('/') ? "default" : "ghost"} 
                size="sm" 
                className="flex items-center gap-1"
              >
                <HomeIcon className="h-4 w-4" />
                <span className="hidden md:inline">Home</span>
              </Button>
            </Link>
            <Link to="/vote">
              <Button 
                variant={isActive('/vote') ? "default" : "ghost"} 
                size="sm" 
                className="flex items-center gap-1"
              >
                <CheckSquare className="h-4 w-4" />
                <span className="hidden md:inline">Vote</span>
              </Button>
            </Link>
            <Link to="/results">
              <Button 
                variant={isActive('/results') ? "default" : "ghost"} 
                size="sm" 
                className="flex items-center gap-1"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline">Results</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
