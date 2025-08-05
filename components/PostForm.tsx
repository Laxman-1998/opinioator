import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/auth';
import { generateAnonymousName } from '../lib/generateAnonymousName'; // Make sure this file exists

// Define the predefined poll templates for the dropdown
const pollTemplates = [
  { display: 'Standard: Agree / Disagree', agree: 'Agree', disagree: 'Disagree' },
  { display: 'Confirmation: Yes / No', agree: 'Yes', disagree: 'No' },
  { display: 'Stance: For / Against', agree: 'For', disagree: 'Against' },
  { display: 'Rating: Good / Bad', agree: 'Good', disagree: 'Bad' },
  { display: 'Belief: True / False', agree: 'True', disagree: 'False' },
];

type PostFormProps = {
  onPostSuccess: () => void;
};

const PostForm = ({ onPostSuccess }: PostFormProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  // State now holds the labels from the first template by default
  const [label_agree, setLabelAgree] = useState(pollTemplates[0].agree);
  const [label_disagree, setLabelDisagree] = useState(pollTemplates[0].disagree);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This function updates the labels when the user changes the dropdown selection
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value, 10);
    const selectedTemplate = pollTemplates[selectedIndex];
    setLabelAgree(selectedTemplate.agree);
    setLabelDisagree(selectedTemplate.disagree);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !content.trim()) {
      toast.error('Opinion cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Sharing your thought...');
    
    // 1. Generate the anonymous name
    const anonymous_name = generateAnonymousName();

    // 2. Create the new post object with all required fields
    const newPost = {
      user_id: user.id,
      content,
      anonymous_name, // This is now correctly included
      label_agree,
      label_disagree,
    };

    try {
      const { error } = await supabase.from('posts').insert([newPost]);
      if (error) throw error;
      toast.success('Your thought has been shared!', { id: loadingToast });
      onPostSuccess(); // This will close the modal and refresh the feed
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(`Error: ${error.message || 'Could not share post.'}`, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 p-6 bg-slate-900/50 border border-slate-800 rounded-lg">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind? Share your opinion, dilemma, or question..."
        className="w-full h-40 p-4 bg-slate-800/60 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        maxLength={1000}
        required
        disabled={isSubmitting}
      />
      
      {/* The two text inputs are now replaced with one dropdown menu */}
      <div>
        <label htmlFor="poll_template" className="block text-sm font-medium text-slate-400 mb-1">
          Poll Type
        </label>
        <select
          id="poll_template"
          onChange={handleTemplateChange}
          disabled={isSubmitting}
          className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:bg-slate-800/40"
        >
          {pollTemplates.map((template, index) => (
            <option key={index} value={index}>
              {template.display}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || content.trim().length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg text-center cursor-pointer transition-colors duration-200"
      >
        {isSubmitting ? 'Sharing...' : 'Share Anonymously'}
      </button>
    </form>
  );
};

export default PostForm;