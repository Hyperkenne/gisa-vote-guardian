
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="bg-gradient-election text-white py-16 md:py-24">
          <div className="election-container">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                GISA Student Elections 2025
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">
                Vote for your representatives and shape the future of our student community.
                Make your voice heard in this important election.
              </p>
              <Link to="/vote">
                <Button size="lg" variant="secondary" className="text-election-dark font-bold">
                  Vote Now <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        <section className="election-container py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-election-dark mb-4">How to Vote</h2>
              <p className="text-gray-600">
                Voting is simple and secure. Each device can only vote once for each position
                to ensure a fair election. Click on your preferred candidate in each category.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-election-dark mb-4">Election Positions</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>President</li>
                <li>Vice President</li>
                <li>General Secretary</li>
                <li>Sports & Welfare</li>
              </ul>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
              <h2 className="text-2xl font-bold text-election-dark mb-4">Results</h2>
              <p className="text-gray-600">
                Election results are updated in real-time as votes come in. Check the results
                page to see the current standings.
              </p>
              <div className="mt-4">
                <Link to="/results">
                  <Button variant="outline">
                    View Results
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <section className="bg-election-light py-16">
          <div className="election-container text-center">
            <h2 className="text-3xl font-bold text-election-dark mb-6">Ready to Make a Difference?</h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              Your vote matters in shaping the future of our student community. 
              Take part in this democratic process and help elect the best leaders.
            </p>
            <Link to="/vote">
              <Button size="lg" className="bg-election-primary hover:bg-election-dark">
                Cast Your Vote
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-900 text-white py-6">
        <div className="election-container text-center">
          <p>© 2025 GISA Elections. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-2">
            Secured with device fingerprinting technology
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
