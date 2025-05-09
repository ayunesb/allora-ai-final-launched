
import React from 'react';
import { WebhookStatus, WebhookType } from '@/types/fixed/Webhook';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Custom DatePickerWithRange component
interface DatePickerWithRangeProps {
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (range: [Date | null, Date | null]) => void;
}

const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({ dateRange, onDateRangeChange }) => {
  const [from, to] = dateRange;
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const handleSelectDate = (date: Date) => {
    let newDateRange: [Date | null, Date | null];
    if (!from) {
      newDateRange = [date, null];
    } else if (!to) {
      newDateRange = from > date ? [date, from] : [from, date];
      setIsCalendarOpen(false);
    } else {
      newDateRange = [date, null];
    }
    onDateRangeChange(newDateRange);
  };

  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="justify-start text-left font-normal w-full"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {from && to ? (
            <>
              {format(from, 'PP')} - {format(to, 'PP')}
            </>
          ) : (
            <>Select date range</>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{
            from,
            to,
          }}
          onSelect={(range) => {
            onDateRangeChange([range?.from || null, range?.to || null]);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

interface WebhookEventFiltersProps {
  filters: {
    types: WebhookType[];
    status: WebhookStatus | '';
    dateRange: [Date | null, Date | null];
    search: string;
  };
  onFilterChange: (filters: any) => void;
  availableTypes: WebhookType[];
}

export function WebhookEventFilters({ filters, onFilterChange, availableTypes }: WebhookEventFiltersProps) {
  const handleTypeChange = (type: string) => {
    const webhookType = type as WebhookType;
    const currentTypes = filters.types || [];
    
    // Toggle the type selection
    const newTypes = currentTypes.includes(webhookType)
      ? currentTypes.filter(t => t !== webhookType)
      : [...currentTypes, webhookType];
    
    onFilterChange({
      ...filters,
      types: newTypes
    });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({
      ...filters,
      status: status as WebhookStatus | ''
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      search: e.target.value
    });
  };

  const handleDateRangeChange = (dateRange: [Date | null, Date | null]) => {
    onFilterChange({
      ...filters,
      dateRange
    });
  };

  const clearFilters = () => {
    onFilterChange({
      types: [],
      status: '',
      dateRange: [null, null],
      search: ''
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search input */}
        <div>
          <Input
            placeholder="Search webhooks..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        
        {/* Status filter */}
        <div>
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Date range picker */}
        <div>
          <DatePickerWithRange 
            dateRange={filters.dateRange} 
            onDateRangeChange={handleDateRangeChange} 
          />
        </div>
        
        {/* Clear filters */}
        <div>
          <Button 
            onClick={clearFilters} 
            variant="outline" 
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>
      
      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        {availableTypes.map((type) => (
          <Button
            key={type}
            variant={filters.types.includes(type) ? "default" : "outline"}
            size="sm"
            onClick={() => handleTypeChange(type)}
            className="capitalize"
          >
            {type}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default WebhookEventFilters;
