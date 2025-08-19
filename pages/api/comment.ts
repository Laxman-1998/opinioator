// pages/api/comment.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Utilities
const adjectives = ["Cosmic","Nebulous","Stellar","Luminous","Galactic","Silent","Radiant","Solar","Lunar","Distant","Quantum","Turbo","Wandering","Flash"];
const nouns = ["Comet","Nebula","Star","Meteor","Voyager","Rocket","Pulsar","Astro","Satellite","Quasar","Eclipse","Orbit","Photon","Cluster","Magnetar","Nova","Telescope"];
function generateSpaceAnon() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100) + 1;
  return `${adj}_${noun}_${num}`;
}

const SENSITIVE_KEYWORDS = ['violence', 'abuse', 'suicide', 'self-harm', 'hate speech'];
const REPORT_THRESHOLD = 3;
const SPAM_THRESHOLD = 4; // Max 4 identical comments per hour per user
const RATE_LIMIT = 10;    // Max 10 comments per hour per user

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const method = req.method;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // helper: get user from JWT
  async function getUserFromToken(token?: string) {
    if (!token) return null;
    const { data: { user } } = await supabase.auth.getUser(token);
    return user;
  }

  // helper: admin client for mutation
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // POST = comment/reply, report, vote, like
    if (method === 'POST') {
      const { type, post_id, content, parent_comment_id, commentId, voteType, reason, additionalInfo } = req.body;
      const token = req.headers.authorization?.split(' ')[1];
      const user = await getUserFromToken(token);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      // 1. Comment: "type" = "comment"
      if (type === 'comment') {
        // -- Rate limiting
        const { data: recentComments } = await supabase
          .from('comments')
          .select('id, content, created_at')
          .eq('user_id', user.id)
          .gte('created_at', new Date(Date.now() - 60*60*1000).toISOString());

        if ((recentComments?.length ?? 0) > RATE_LIMIT) {
          return res.status(429).json({ error: 'Rate limit exceeded: Only 10 comments per hour allowed.' });
        }

        // -- Spam protection
        const sameContentCount = recentComments?.filter(c => c.content.trim() === content.trim()).length ?? 0;
        if (sameContentCount > SPAM_THRESHOLD) {
          return res.status(400).json({ error: 'Spam detected: Too many identical comments.' });
        }

        // Insert comment
        const anonymous_name = generateSpaceAnon();
        const fields: any = {
          content,
          post_id,
          user_id: user.id,
          anonymous_name,
          upvotes: 0,
          downvotes: 0,
          likeCount: 0,
          reportCount: 0,
          reportReasons: [],
          hidden: false,
          parent_comment_id: parent_comment_id || null,
        };
        // Sensitive content flag (optionally tracked/logged in system)
        if (SENSITIVE_KEYWORDS.some((kw) => content.toLowerCase().includes(kw))) {
          fields.sensitive = true;
        }

        const { error: insertError } = await supabaseAdmin
          .from('comments')
          .insert([fields]);
        if (insertError) throw insertError;

        return res.status(200).json({ message: "Comment posted successfully." });
      }

      // 2. Reporting: "type" = "report"
      if (type === 'report') {
        // Update report count/reasons & check hide threshold
        const { data: commentData, error } = await supabaseAdmin
          .from('comments')
          .select('reportCount, reportReasons')
          .eq('id', commentId)
          .single();
        if (!!error || !commentData) throw error || new Error("Comment not found");

        const newReportCount = (commentData.reportCount ?? 0) + 1;
        const newReportReasons = Array.isArray(commentData.reportReasons)
          ? [...commentData.reportReasons, reason] : [reason];

        // Hide if threshold reached
        const updates: any = {
          reportCount: newReportCount,
          reportReasons: newReportReasons,
        };
        if (newReportCount >= REPORT_THRESHOLD) updates.hidden = true;

        await supabaseAdmin.from('comments').update(updates).eq('id', commentId);

        return res.status(200).json({ message: "Comment reported" });
      }

      // 3. Voting: "type" = "vote"
      if (type === 'vote') {
        if (!voteType) return res.status(400).json({ error: 'No vote type' });
        const voteField =
          voteType === 'upvote' ? 'upvotes'
          : voteType === 'downvote' ? 'downvotes'
          : null;
        if (!voteField)
          return res.status(400).json({ error: 'Invalid vote type' });

        const { data: commentData, error } = await supabaseAdmin
          .from('comments')
          .select(voteField)
          .eq('id', commentId)
          .single();
        if (!!error || !commentData) throw error || new Error("Comment not found");

        await supabaseAdmin
          .from('comments')
          .update({ [voteField]: (commentData[voteField] ?? 0) + 1 })
          .eq('id', commentId);

        return res.status(200).json({ message: "Vote recorded" });
      }

      // 4. Like: "type" = "like"
      if (type === 'like') {
        const { data: commentData, error } = await supabaseAdmin
          .from('comments')
          .select('likeCount')
          .eq('id', commentId)
          .single();
        if (!!error || !commentData) throw error || new Error("Comment not found");

        await supabaseAdmin
          .from('comments')
          .update({ likeCount: (commentData.likeCount ?? 0) + 1 })
          .eq('id', commentId);

        return res.status(200).json({ message: "Like recorded" });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    // GET: Return comments, including hidden status
    if (method === 'GET') {
      const { post_id, sort, filter } = req.query;
      let query = supabaseAdmin
        .from('comments')
        .select('*')
        .eq('post_id', Number(post_id))
        .eq('hidden', false);

      if (sort === 'liked') query = query.order('likeCount', { ascending: false });
      else if (sort === 'upvote') query = query.order('upvotes', { ascending: false });
      else query = query.order('created_at', { ascending: false }); // recent

      // Basic filter (content or name contains filter string)
      if (typeof filter === 'string' && filter.trim() !== '') {
        query = query.ilike('content', `%${filter.trim()}%`);
      }

      const { data: comments, error } = await query;
      if (error) throw error;

      return res.status(200).json({ comments });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in /api/comment:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
}
