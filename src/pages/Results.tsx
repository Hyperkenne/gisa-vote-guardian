import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getVoteCounts, AllVoteCounts } from '@/utils/votingUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Candidate information for display
const candidateInfo = {
  "pres_01": { name: "Sophiya Sharma", country: "Nepal", course: "BBA" },
  "pres_02": { name: "Muhammed Lamin Jabbi", country: "Gambia", course: "MBA" },
  "vp_01": { name: "Yak Majok", country: "South Sudan", course: "B-Tech CSE" },
  "vp_02": { name: "Ibrahim Hafez", country: "Syria", course: "B-Tech CSE" },
  "vp_03": { name: "Hrishita Rauniyar", country: "Nepal", course: "MBA" },
  "gs_01": { name: "Malinga Aaron", country: "Uganda", course: "B-Tech Civil Engineering" },
  "gs_02": { name: "Kusum Patel", country: "Nepal", course: "BBA" },
  "sw_01": { name: "Sylvester Mbah", country: "Cameroon", course: "B-Tech Mechanical Engineering" },
  "sw_02": { name: "Elsa Farhan Agung", country: "Indonesia", course: "BBA" },
};

// Position titles for display
const positionTitles = {
  president: "President",
  vicePresident: "Vice President",
  generalSecretary: "General Secretary",
  sportsWelfare: "Sports & Welfare"
};

// Chart colors
const COLORS = ['#1a56db', '#0ea5e9', '#38bdf8', '#7dd3fc', '#d4af37'];

const Results = () => {
  const [voteCounts, setVoteCounts] = useState<AllVoteCounts>({
    president: {},
    vicePresident: {},
    generalSecretary: {},
    sportsWelfare: {}
  });
  
  // Load vote counts
  useEffect(() => {
    // Initial load
    setVoteCounts(getVoteCounts());
    
    // Set up periodic refresh
    const intervalId = setInterval(() => {
      setVoteCounts(getVoteCounts());
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Calculate total votes for a position
  const getTotalVotes = (position: keyof AllVoteCounts) => {
    return Object.values(voteCounts[position]).reduce((sum, count) => sum + count, 0);
  };
  
  // Format data for pie chart
  const formatChartData = (position: keyof AllVoteCounts) => {
    return Object.entries(voteCounts[position]).map(([candidateId, votes]) => ({
      name: (candidateInfo as any)[candidateId]?.name || candidateId,
      value: votes
    }));
  };
  
  return (
    <>
      <div className="bg-election-light py-8">
        <div className="election-container">
          <h1 className="text-3xl md:text-4xl font-bold text-election-dark">Election Results</h1>
          <p className="text-gray-600 mt-2">
            Live voting results updated in real-time.
          </p>
        </div>
      </div>
      
      <div className="election-container py-8">
        <div className="grid grid-cols-1 gap-8">
          {(Object.keys(positionTitles) as Array<keyof typeof positionTitles>).map((position) => {
            const totalVotes = getTotalVotes(position);
            const chartData = formatChartData(position);
            
            return (
              <Card key={position} className="overflow-hidden">
                <CardHeader className="bg-election-light">
                  <CardTitle>{positionTitles[position]} Results</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      {Object.entries(voteCounts[position]).map(([candidateId, votes]) => {
                        const percent = totalVotes ? Math.round((votes / totalVotes) * 100) : 0;
                        const candidate = (candidateInfo as any)[candidateId];
                        
                        return (
                          <div key={candidateId} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-medium">{candidate?.name || candidateId}</h3>
                                <p className="text-sm text-gray-500">
                                  {candidate?.country} • {candidate?.course}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-election-primary">{votes}</span>
                                <span className="text-gray-500 ml-1">({percent}%)</span>
                              </div>
                            </div>
                            <Progress value={percent} className="h-2" />
                          </div>
                        );
                      })}
                      
                      <div className="text-sm text-gray-500 pt-2">
                        Total votes: {totalVotes}
                      </div>
                    </div>
                    
                    <div className="h-64">
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-gray-500">No votes recorded yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Results;
