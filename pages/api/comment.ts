import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Manually get the auth token ("passport") from the request header.
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No auth token provided.' });
    }

    // 2. Create a Supabase client instance.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // 3. Get the user by validating the token. This is the crucial step.
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: userError?.message || 'Unauthorized: Invalid token.' });
    }
    
    // If we get here, the user is successfully authenticated!
    const { content, post_id } = req.body;

    if (!content || !post_id) {
      return res.status(400).json({ error: 'Missing content or post_id' });
    }

    // 4. Perform the insert into the database as the authenticated user.
    const { error: insertError } = await supabase
      .from('comments')
      .insert([{ content, post_id, user_id: user.id }]);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return res.status(500).json({ error: insertError.message });
    }

    return res.status(200).json({ message: "Comment posted successfully." });

  } catch (error) {
    console.error("Catch block error:", error);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
}