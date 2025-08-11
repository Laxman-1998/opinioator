import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';
import { generateAnonymousName } from '../../lib/generateAnonymousName';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { content, label_agree, label_disagree, user_id, country } = req.body;

  if (!content || !user_id) {
    return res.status(400).json({ error: 'Missing required fields: content or user_id' });
  }

  const newPost = {
    content,
    label_agree,
    label_disagree,
    user_id,
    country: country || null,
    anonymous_name: generateAnonymousName()
  };

  try {
    const { error } = await supabase
      .from('posts')
      .insert([newPost]);

    if (error) {
      console.error('Supabase insert error:', error, 'Payload:', newPost);
      return res.status(500).json({ error: 'Failed to create post due to database error' });
    }

    res.status(201).json({ message: 'Post created successfully' });
  } catch (error) {
    console.error('Unexpected error in /api/post:', error);
    res.status(500).json({ error: 'Unexpected server error' });
  }
}
