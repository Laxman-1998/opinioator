// pages/api/post.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';
import { generateAnonymousName } from '../../lib/generateAnonymousName';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { content, label_agree, label_disagree, user_id, country } = req.body;

    if (!content || !user_id) {
      return res.status(400).json({ error: 'Missing required fields: content or user_id' });
    }

    // Prepare new post data
    const newPost = {
      content,
      label_agree,
      label_disagree,
      user_id,
      country: country || null,
      anonymous_name: generateAnonymousName()
    };

    try {
      // Insert without returning inserted rows to prevent RLS SELECT issues
      const { error } = await supabase
        .from('posts')
        .insert([newPost], { returning: 'minimal' });

      if (error) {
        console.error('Supabase insert error:', error, 'Payload:', newPost);
        return res.status(500).json({ error: 'Failed to create post due to database error' });
      }

      res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
      console.error('Unexpected error in /api/post:', error);
      res.status(500).json({ error: 'Unexpected server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
