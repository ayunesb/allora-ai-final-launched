
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface PerformanceOverviewProps {
  data?: any;
  isLoading?: boolean;
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading performance data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Performance metrics will be displayed here</p>
      </CardContent>
    </Card>
  );
};

export default PerformanceOverview;
