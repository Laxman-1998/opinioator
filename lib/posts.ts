import { supabase } from './supabaseClient';
import { Post } from './types';

// Fetches all posts for the global feed
export const fetchAllPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, content, created_at, anonymous_name, agree_count,
      disagree_count, label_agree, label_disagree, user_id
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
  return data || [];
};

// Fetches posts for a specific user for the dashboard
export const fetchUserPosts = async (userId: string): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id, content, created_at, anonymous_name, agree_count,
      disagree_count, label_agree, label_disagree, user_id
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching posts for user ${userId}:`, error);
    return [];
  }
  return data || [];
};