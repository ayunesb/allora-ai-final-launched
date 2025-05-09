
import React, { useState, useEffect } from 'react';
import WebhookEventTable from './WebhookEventTable';
import WebhookEventFilters from './WebhookEventFilters';
import EventDetailsModal from './EventDetailsModal';
import useWebhookHistoryFilters from '@/hooks/admin/useWebhookHistoryFilters';
import { WebhookEvent, WebhookType } from '@/types/fixed/Webhook';

interface WebhookHistoryContentProps {
  events: WebhookEvent[];
}

export function WebhookHistoryContent({ events: initialEvents }: WebhookHistoryContentProps) {
  // State for event detail modal
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  
  // Setup filters
  const { filter, updateFilter, resetFilter } = useWebhookHistoryFilters();
  
  // State for filtered events
  const [filteredEvents, setFilteredEvents] = useState<WebhookEvent[]>(initialEvents);
  
  // Get unique webhook types from events
  const availableTypes = React.useMemo(() => {
    const types = new Set<string>();
    initialEvents.forEach(event => {
      const type = event.webhookType || event.webhook_type || event.type;
      if (type) types.add(type);
    });
    return Array.from(types) as WebhookType[];
  }, [initialEvents]);
  
  // Filter events when filter changes
  useEffect(() => {
    const filtered = initialEvents.filter(event => {
      // Type filter
      if (filter.types.length > 0) {
        const eventType = event.webhookType || event.webhook_type || event.type;
        if (!filter.types.includes(eventType as WebhookType)) return false;
      }
      
      // Status filter
      if (filter.status && event.status !== filter.status) return false;
      
      // Date range filter
      if (filter.dateRange[0] || filter.dateRange[1]) {
        const date = new Date(event.timestamp || event.created_at);
        if (filter.dateRange[0] && date < filter.dateRange[0]) return false;
        if (filter.dateRange[1] && date > filter.dateRange[1]) return false;
      }
      
      // Search filter
      if (filter.search) {
        const search = filter.search.toLowerCase();
        const url = (event.targetUrl || event.url || '').toLowerCase();
        const eventType = (event.event_type || event.eventType || '').toLowerCase();
        const source = (event.source || '').toLowerCase();
        
        if (!url.includes(search) && !eventType.includes(search) && !source.includes(search)) {
          return false;
        }
      }
      
      return true;
    });
    
    setFilteredEvents(filtered);
  }, [filter, initialEvents]);
  
  // Handle filter changes
  const handleFilterChange = (newFilter: Partial<typeof filter>) => {
    updateFilter(newFilter);
  };
  
  // Open event details modal
  const handleViewEventDetail = (event: WebhookEvent) => {
    setSelectedEvent(event);
  };
  
  // Close event details modal
  const handleCloseEventDetail = () => {
    setSelectedEvent(null);
  };
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <WebhookEventFilters 
        filters={filter}
        onFilterChange={handleFilterChange}
        availableTypes={availableTypes}
      />
      
      {/* Event Table */}
      <WebhookEventTable 
        events={filteredEvents}
        onViewDetail={handleViewEventDetail}
      />
      
      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal 
          event={selectedEvent} 
          isOpen={selectedEvent !== null} 
          onClose={handleCloseEventDetail}
        />
      )}
    </div>
  );
}

export default WebhookHistoryContent;
