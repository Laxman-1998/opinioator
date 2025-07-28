import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  try {
    const { content, post_id } = req.body;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { data, error } = await supabase
      .from('comments')
      .insert([{ content, post_id, user_id: user.id }])
      .select().single();
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment' });
  }
}
