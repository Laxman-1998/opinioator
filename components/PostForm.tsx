import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/auth';
import { generateAnonymousName } from '../lib/generateAnonymousName';

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
  const [label_agree, setLabelAgree] = useState(pollTemplates[0].agree);
  const [label_disagree, setLabelDisagree] = useState(pollTemplates[0].disagree);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value, 10);
    const selectedTemplate = pollTemplates[selectedIndex];
    setLabelAgree(selectedTemplate.agree);
    setLabelDisagree(selectedTemplate.disagree);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading('Sharing your thought...');
    
    const anonymous_name = generateAnonymousName();
    const newPost = { user_id: user.id, content, anonymous_name, label_agree, label_disagree };

    const { error } = await supabase.from('posts').insert([newPost]);

    setIsSubmitting(false);

    if (error) {
      console.error('Error creating post:', error);
      toast.error(`Error: ${error.message}`, { id: loadingToast });
    } else {
      toast.success('Your thought has been shared!', { id: loadingToast });
      onPostSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 p-6 bg-slate-900/50 border border-slate-800 rounded-lg">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind? Share your opinion, dilemma, or question..."
        className="w-full h-40 p-4 bg-slate-800/60 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        required
        disabled={isSubmitting}
      />
      <div>
        <label htmlFor="poll_template" className="block text-sm font-medium text-slate-400 mb-1">Poll Type</label>
        <select
          id="poll_template"
          onChange={handleTemplateChange}
          disabled={isSubmitting}
          className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:bg-slate-800/40"
        >
          {pollTemplates.map((template, index) => (
            <option key={index} value={index}>{template.display}</option>
          ))}
        </select>
      </div>
      
      {/* 👇 This is the new, more "effective" button styling */}
      <button
        type="submit"
        disabled={isSubmitting || content.trim().length === 0}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-lg text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:from-slate-700 disabled:to-slate-800 disabled:cursor-not-allowed disabled:scale-100"
      >
        {isSubmitting ? 'Sharing...' : 'Share Anonymously'}
      </button>
    </form>
  );
};

export default PostForm;