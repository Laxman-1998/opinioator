// pages/api/post.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';
import { generateAnonymousName } from '../../lib/generateAnonymousName';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { content, label_agree, label_disagree, user_id, country } = req.body;

    if (!content || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // ✅ Generate anonymous name for this post
    const anonymous_name = generateAnonymousName();

    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          content,
          label_agree,
          label_disagree,
          user_id,
          country,
          anonymous_name // ✅ saved in DB
        }
      ])
      .select(); // Return inserted rows

    if (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ error: 'Failed to create post' });
    }

    res.status(200).json(data[0]);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
