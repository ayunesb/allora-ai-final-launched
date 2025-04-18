
import React from 'react';
import { SocialMediaPost } from '@/types/socialMedia';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth, 
  isToday,
  parseISO,
  isSameDay
} from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import SocialPostCard from '../SocialPostCard';
import { useBreakpoint } from '@/hooks/use-mobile';

interface SocialMediaCalendarViewProps {
  posts: SocialMediaPost[];
  currentMonth: Date;
  onEditPost: (post: SocialMediaPost) => void;
  onDeletePost: (postId: string) => Promise<{ success: boolean; error?: string }>;
  onSchedulePost: (postId: string) => Promise<{ success: boolean; error?: string }>;
  onApprovePost: (postId: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Calendar view for social media posts
 * Displays posts organized by day in a monthly calendar format
 */
export default function SocialMediaCalendarView({
  posts,
  currentMonth,
  onEditPost,
  onDeletePost,
  onSchedulePost,
  onApprovePost
}: SocialMediaCalendarViewProps) {
  const breakpoint = useBreakpoint();
  const isMobile = ['xs', 'mobile'].includes(breakpoint);
  
  // Get all days in the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the day of week for the first day (0 for Sunday, 1 for Monday, etc.)
  const startDay = monthStart.getDay();
  
  // Find posts for a specific day
  const getPostsForDay = (day: Date) => {
    return posts.filter(post => {
      const postDate = parseISO(post.scheduled_date);
      return isSameDay(postDate, day);
    });
  };
  
  // Get platform color
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Facebook':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200';
      case 'Instagram':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-200';
      case 'LinkedIn':
        return 'bg-blue-900 text-white dark:bg-blue-700/50 dark:text-white';
      case 'Twitter':
        return 'bg-blue-400 text-white dark:bg-blue-500/50 dark:text-white';
      case 'TikTok':
        return 'bg-black text-white dark:bg-black/70 dark:text-white';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-200';
    }
  };
  
  // Create an array of 7 days (for the week header)
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="mt-4">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, i) => (
          <div 
            key={i} 
            className="text-center font-medium text-xs sm:text-sm py-2"
          >
            {isMobile ? day.charAt(0) : day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the start of the month */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div 
            key={`empty-start-${i}`} 
            className="bg-secondary/30 rounded-md min-h-[80px] sm:min-h-[120px]"
          ></div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, i) => {
          const dayPosts = getPostsForDay(day);
          
          return (
            <div 
              key={i}
              className={cn(
                "border rounded-md min-h-[80px] sm:min-h-[120px] p-1 relative",
                isToday(day) ? "border-primary" : "border-border/50",
                !isSameMonth(day, currentMonth) && "bg-secondary/20 text-muted-foreground"
              )}
            >
              <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
                <div className={cn(
                  "flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full text-xs font-medium",
                  isToday(day) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}>
                  {format(day, 'd')}
                </div>
              </div>
              
              <div className="mt-1 space-y-1 max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                {dayPosts.map((post) => (
                  <TooltipProvider key={post.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={cn(
                            "text-xs p-1 rounded cursor-pointer truncate touch-target",
                            getPlatformColor(post.platform)
                          )}
                          onClick={() => onEditPost(post)}
                        >
                          {post.title}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side={isMobile ? "bottom" : "right"} align="start" className="max-w-xs">
                        <SocialPostCard 
                          post={post}
                          onEdit={() => onEditPost(post)}
                          onDelete={() => onDeletePost(post.id)}
                          onSchedule={() => onSchedulePost(post.id)}
                          onApprove={() => onApprovePost(post.id)}
                          compact
                        />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
