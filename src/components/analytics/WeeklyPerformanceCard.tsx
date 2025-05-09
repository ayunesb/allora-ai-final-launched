
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface WeeklyPerformanceCardProps {
  data?: any;
  isLoading?: boolean;
}

const WeeklyPerformanceCard: React.FC<WeeklyPerformanceCardProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading weekly performance data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Weekly performance metrics will be displayed here</p>
      </CardContent>
    </Card>
  );
};

export default WeeklyPerformanceCard;
