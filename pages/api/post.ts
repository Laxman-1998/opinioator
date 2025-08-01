import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";
import { generateAnonymousName } from "../../lib/generateAnonymousName";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { title, content, user_id, poll_options } = req.body;

    const anonymous_name = generateAnonymousName();

    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          title,
          content,
          user_id,
          poll_options,
          anonymous_name,
        },
      ])
      .select("*");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ post: data[0] });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
