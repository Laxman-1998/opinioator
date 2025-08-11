// pages/api/post.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { generateAnonymousName } from '../../lib/generateAnonymousName';

// Environment variables must be set in Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 1️⃣ Get user token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  // 2️⃣ Create Supabase client **as the user**
  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  // 3️⃣ Verify token & fetch user info
  const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
  if (userError || !user) {
    console.error('Token verification failed:', userError);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  const { content, label_agree, label_disagree, country } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Missing required field: content' });
  }

  // 4️⃣ Build the new post
  const newPost = {
    content,
    label_agree,
    label_disagree,
    user_id: user.id, // matches auth.uid() in RLS
    country: country || null,
    anonymous_name: generateAnonymousName(),
  };

  try {
    // 5️⃣ Insert as this specific authenticated user
    const { error } = await supabaseUser
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
