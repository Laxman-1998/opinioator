// pages/api/comment.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// --- Space name generator ---
const adjectives = [
  "Cosmic", "Nebulous", "Stellar", "Luminous", "Galactic", "Silent", "Radiant",
  "Solar", "Lunar", "Distant", "Quantum", "Turbo", "Wandering", "Flash"
];
const nouns = [
  "Comet", "Nebula", "Star", "Meteor", "Voyager", "Rocket", "Pulsar", "Astro",
  "Satellite", "Quasar", "Eclipse", "Orbit", "Photon", "Cluster", "Magnetar", "Nova", "Telescope"
];
function generateSpaceAnon() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100) + 1;
  return `${adj}_${noun}_${num}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    // 1. Create a temporary client to validate the user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error('Invalid token');
    // If we get here, the user is valid.

    // 2. Now, create the admin client with the service_role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { content, post_id } = req.body;

    // 3. Generate anonymous name
    const anonymous_name = generateSpaceAnon();

    // 4. Insert the comment with the anonymous_name
    const { error: insertError } = await supabaseAdmin
      .from('comments')
      .insert([{ content, post_id, user_id: user.id, anonymous_name }]);
    if (insertError) throw insertError;

    return res.status(200).json({ message: "Comment posted successfully." });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    console.error("Error in /api/comment:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
}
