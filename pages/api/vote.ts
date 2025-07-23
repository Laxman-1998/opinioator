import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { postId, voteType } = req.body;

  if (!postId || !['agree', 'disagree'].includes(voteType)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  try {
    const { error } = await supabase.rpc('increment_vote', {
      post_id: postId,
      vote_type: voteType,
    });

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error recording vote' });
  }
}