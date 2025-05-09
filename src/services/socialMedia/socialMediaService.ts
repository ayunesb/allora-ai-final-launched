
import { supabase } from '@/backend/supabase';
import { SocialMediaPost, CreatePostInput, SocialMediaCalendarFilters } from '@/types/socialMedia';
import { api } from '@/services/api/apiClient';
import { logger } from '@/utils/loggingService';

/**
 * Fetch all social media posts for a company with optional filters
 */
export async function fetchSocialMediaPosts(
  companyId: string, 
  filters?: SocialMediaCalendarFilters
): Promise<SocialMediaPost[]> {
  try {
    logger.info('Fetching social media posts from database', { companyId, filters });
    
    let query = supabase
      .from('social_media_posts')
      .select('*')
      .eq('company_id', companyId);
    
    // Apply filters if provided
    if (filters) {
      if (filters.platform) {
        query = query.eq('platform', filters.platform);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status.toLowerCase());
      }
      
      if (filters.content_type) {
        query = query.eq('content_type', filters.content_type);
      }
      
      if (filters.campaign_id) {
        query = query.eq('campaign_id', filters.campaign_id);
      }
      
      if (filters.author_id) {
        query = query.eq('author_id', filters.author_id);
      }
      
      if (filters.startDate && filters.endDate) {
        query = query.gte('scheduled_date', filters.startDate)
                     .lte('scheduled_date', filters.endDate);
      } else if (filters.startDate) {
        query = query.gte('scheduled_date', filters.startDate);
      } else if (filters.endDate) {
        query = query.lte('scheduled_date', filters.endDate);
      }
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }
    }
    
    // Order by scheduled date
    query = query.order('scheduled_date', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data || [];
    
  } catch (error) {
    logger.error('Error fetching posts from database:', error);
    
    // Return a fallback if there's an error (for better UX)
    return [];
  }
}

/**
 * Create a new social media post
 */
export async function createSocialMediaPost(
  companyId: string,
  postData: CreatePostInput
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    logger.info('Creating new social media post in database', { companyId, postData });
    
    // Get the current authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { 
        success: false, 
        error: 'Not authenticated' 
      };
    }
    
    // Insert post into database
    const { data, error } = await supabase
      .from('social_media_posts')
      .insert({
        company_id: companyId,
        author_id: user.id,
        title: postData.title,
        content: postData.content,
        platform: postData.platform,
        scheduled_date: postData.scheduled_date,
        publish_time: postData.publish_time,
        status: 'draft',
        content_type: postData.content_type,
        media_urls: postData.media_urls,
        campaign_id: postData.campaign_id,
        is_approved: postData.is_approved || false,
        tags: postData.tags || [],
        mentions: postData.mentions || [],
        hashtags: postData.hashtags || [],
        location: postData.location,
        link_url: postData.link_url
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    return { 
      success: true, 
      postId: data.id 
    };
  } catch (error: any) {
    logger.error('Error creating post in database:', error);
    
    return { 
      success: false, 
      error: error.message || 'Failed to create post' 
    };
  }
}

/**
 * Delete a social media post
 */
export async function deleteSocialMediaPost(
  postId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    logger.info('Deleting social media post from database', { postId });
    
    const { error } = await supabase
      .from('social_media_posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    logger.error('Error deleting post from database:', error);
    
    return { 
      success: false, 
      error: error.message || 'Failed to delete post' 
    };
  }
}

/**
 * Schedule a post for publication
 */
export async function schedulePost(
  postId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    logger.info('Scheduling post in database', { postId });
    
    const { error } = await supabase
      .from('social_media_posts')
      .update({ status: 'scheduled' })
      .eq('id', postId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    logger.error('Error scheduling post in database:', error);
    
    return { 
      success: false, 
      error: error.message || 'Failed to schedule post' 
    };
  }
}

/**
 * Approve a social media post
 */
export async function approvePost(
  postId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    logger.info('Approving post in database', { postId, notes });
    
    const { error } = await supabase
      .from('social_media_posts')
      .update({ 
        is_approved: true,
        approval_notes: notes,
        status: 'approved'
      })
      .eq('id', postId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    logger.error('Error approving post in database:', error);
    
    return { 
      success: false, 
      error: error.message || 'Failed to approve post' 
    };
  }
}
