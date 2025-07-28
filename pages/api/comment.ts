import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Create a temporary client to validate the user's token ("passport")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error('Invalid token');

    // If we get here, the user is valid.
    
    // 2. Now, create a powerful "admin" client using our new master key.
    // This client can bypass RLS rules because we have already verified the user.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { content, post_id } = req.body;
    
    // 3. Insert the data using the admin client.
    const { error: insertError } = await supabaseAdmin
      .from('comments')
      .insert([{ content, post_id, user_id: user.id }]);

    if (insertError) throw insertError;

    return res.status(200).json({ message: "Comment posted successfully." });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    console.error("Error in /api/comment:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
}