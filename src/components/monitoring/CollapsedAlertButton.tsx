
import React from 'react';
import { Button } from "@/components/ui/button";
import { Alert } from '@/utils/monitoring';
import { AlertStatusIcon } from './AlertIcon';

interface CollapsedAlertButtonProps {
  alerts: Alert[];
  onClick: () => void;
}

export const CollapsedAlertButton = ({ alerts, onClick }: CollapsedAlertButtonProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        size="sm" 
        variant="outline" 
        className="rounded-full p-2" 
        onClick={onClick}
      >
        <AlertStatusIcon severity={alerts[0].severity} />
        <span className="ml-2">{alerts.length} Alert{alerts.length !== 1 ? 's' : ''}</span>
      </Button>
    </div>
  );
};
