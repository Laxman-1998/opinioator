import { supabase } from './supabaseClient';
import { Post } from './types';

export const fetchAllPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select(`*`) // Select all fields, which will include anonymous_name
    .order('created_at', { ascending: false });

  if (error) { console.error('Error fetching posts:', error); return []; }
  return data || [];
};

export const fetchUserPosts = async (userId: string): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select(`*`) // Select all fields
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.error(`Error fetching posts for user ${userId}:`, error); return []; }
  return data || [];
};