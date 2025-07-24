// app/components/CommentForm.tsx
'use client';

import { useState } from 'react';

interface CommentFormProps {
  postId: string; // We'll use the post's unique ID
}

export default function CommentForm({ postId }: CommentFormProps) {
  const [commentText, setCommentText] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const maxChars = 500;

  const handleShare = () => {
    // In the next step, we'll add the logic here to save the comment to the database.
    console.log(`Submitting comment for post ${postId}:`, commentText);

    // For now, we'll just reset the form.
    setCommentText('');
    setIsFormVisible(false);
  };

  return (
    <div className="mt-8 w-full max-w-2xl mx-auto">
      {!isFormVisible && (
        <div className="text-center">
          <button
            onClick={() => setIsFormVisible(true)}
            className="text-white/60 hover:text-white transition-colors duration-200 text-lg"
          >
            Add your perspective...
          </button>
        </div>
      )}

      {isFormVisible && (
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm animate-fade-in">
          <p className="text-sm text-white/70 mb-2">Share your thoughts anonymously.</p>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            maxLength={maxChars}
            className="w-full h-28 p-3 bg-black/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
            placeholder="Write your supportive message here..."
            autoFocus
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-white/50">
              {commentText.length}/{maxChars}
            </span>
            <button
              onClick={handleShare}
              disabled={commentText.trim().length === 0}
              className="px-6 py-2 bg-white text-black rounded-full font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}