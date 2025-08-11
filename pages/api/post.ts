// pages/api/post.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';
import { generateAnonymousName } from '../../lib/generateAnonymousName';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  // Verify token and get user info from Supabase
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData?.user) {
    console.error('Token verification failed:', userError);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  const { content, label_agree, label_disagree, country } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Missing required field: content' });
  }

  const newPost = {
    content,
    label_agree,
    label_disagree,
    user_id: userData.user.id, // trusted ID from Supabase auth
    country: country || null,
    anonymous_name: generateAnonymousName(),
  };

  try {
    const { error } = await supabase
      .from('posts')
      .insert([newPost]);

    if (error) {
      console.error('Supabase insert error:', error, 'Payload:', newPost);
      return res.status(500).json({ error: 'Database error on post creation' });
    }

    return res.status(201).json({ message: 'Post created successfully' });
  } catch (err) {
    console.error('Unexpected server error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
