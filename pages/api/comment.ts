import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Create a server-side Supabase client that can access the user's session
  const supabaseServerClient = createServerSupabaseClient({ req, res });

  // Now, get the user. This is a more reliable method on the server.
  const { data: { user } } = await supabaseServerClient.auth.getUser();

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { content, post_id } = req.body;

      if (!content || !post_id) {
        return res.status(400).json({ error: 'Missing content or post_id' });
      }

      const { data, error } = await supabaseServerClient
        .from('comments')
        .insert([{ content, post_id, user_id: user.id }])
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (error) {
       res.status(500).json({ error: 'An unexpected error occurred.' });
    }
  }

  res.setHeader('Allow', ['POST']);
  res.status(405).end('Method Not Allowed');
}