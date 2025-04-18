
import React, { Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";
import { SocialMediaPost, PostStatus } from '@/types/socialMedia';

// Lazy load the calendar and list views for better performance
const CalendarView = lazy(() => import('./calendar/CalendarView'));
const ListView = lazy(() => import('./list/ListView'));

// Create a utility function to ensure a post has a status
function ensurePostStatus(post: SocialMediaPost): SocialMediaPost & { status: PostStatus } {
  return {
    ...post,
    status: (post.status || 'Draft') as PostStatus
  };
}

interface PostsDisplayProps {
  view: 'calendar' | 'list';
  posts: SocialMediaPost[];
  isLoading: boolean;
  error: Error | null;
  currentMonth: Date;
  onEditPost: (post: SocialMediaPost) => void;
  onDeletePost: (postId: string) => Promise<{ success: boolean, error?: string }>;
  onSchedulePost: (postId: string) => Promise<{ success: boolean, error?: string }>;
  onApprovePost: (postId: string) => Promise<{ success: boolean, error?: string }>;
  onCreatePost: () => void;
  onRefresh?: () => void;
  'aria-label'?: string;
}

export function PostsDisplay({
  view,
  posts,
  isLoading,
  error,
  currentMonth,
  onEditPost,
  onDeletePost,
  onSchedulePost,
  onApprovePost,
  onCreatePost,
  onRefresh,
  'aria-label': ariaLabel,
}: PostsDisplayProps) {
  if (isLoading) {
    return (
      <div className="space-y-4" aria-label={ariaLabel}>
        <Skeleton className="h-[40px] w-full rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full h-[300px] flex items-center justify-center">
        <CardContent>
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Posts</h3>
            <p className="text-gray-500 mb-4">{error.message}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" onClick={onRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={onCreatePost}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (posts.length === 0) {
    return (
      <Card className="w-full h-[300px] flex items-center justify-center" aria-label={ariaLabel}>
        <CardContent>
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">No Posts Found</h3>
            <p className="text-gray-500 mb-4">Create your first social media post to get started.</p>
            <Button onClick={onCreatePost}>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Ensure all posts have a status property
  const postsWithStatus = posts.map(ensurePostStatus);
  
  return (
    <div className="space-y-4" aria-label={ariaLabel}>
      <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-md" />}>
        {view === 'calendar' ? (
          <CalendarView 
            posts={postsWithStatus}
            currentMonth={currentMonth}
            onEditPost={onEditPost}
            onDeletePost={onDeletePost}
            onSchedulePost={onSchedulePost}
            onApprovePost={onApprovePost}
            onCreatePost={onCreatePost}
          />
        ) : (
          <ListView 
            posts={postsWithStatus}
            onEditPost={onEditPost}
            onDeletePost={onDeletePost}
            onSchedulePost={onSchedulePost}
            onApprovePost={onApprovePost}
            onCreatePost={onCreatePost}
          />
        )}
      </Suspense>
    </div>
  );
}

export default PostsDisplay;
