import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/auth';
import { generateAnonymousName } from '../lib/generateAnonymousName';

const pollTemplates = [
  { display: 'Standard: Agree / Disagree', agree: 'Agree', disagree: 'Disagree' },
  { display: 'Confirmation: Yes / No', agree: 'Yes', disagree: 'No' },
  { display: 'Stance: For / Against', agree: 'For', disagree: 'Against' },
];

type PostFormProps = {
  onPostSuccess: () => void;
};

const PostForm = ({ onPostSuccess }: PostFormProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [label_agree, setLabelAgree] = useState(pollTemplates[0].agree);
  const [label_disagree, setLabelDisagree] = useState(pollTemplates[0].disagree);
  const [isLoading, setIsLoading] = useState(false);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(e.target.value, 10);
    const selectedTemplate = pollTemplates[selectedIndex];
    setLabelAgree(selectedTemplate.agree);
    setLabelDisagree(selectedTemplate.disagree);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || content.trim().length === 0) return;
    setIsLoading(true);
    
    const anonymous_name = generateAnonymousName();

    try {
      const newPost = {
        content: content,
        user_id: user.id,
        anonymous_name,
        label_agree: label_agree,
        label_disagree: label_disagree,
        country: user.user_metadata.country || null
      };

      const { error } = await supabase.from('posts').insert([newPost]);
      
      if (error) throw error;

      toast.success('Your thought is now live!');
      setContent('');
      onPostSuccess();
      
    } catch (error) {
      toast.error('Sorry, something went wrong.');
      console.error('Error posting opinion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-28 p-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500"
          placeholder="What's on your mind?..."
          disabled={isLoading}
        />
        
        <div>
            <label htmlFor="poll_template" className="block text-sm font-medium text-slate-400 mb-1">Poll Type</label>
            <select
              id="poll_template"
              onChange={handleTemplateChange}
              disabled={isLoading}
              className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 transition"
            >
              {pollTemplates.map((template, index) => (
                <option key={index} value={index}>
                  {template.display}
                </option>
              ))}
            </select>
        </div>

        <div className="flex justify-between items-center">
           <button 
             type="button" 
             onClick={() => {}}
             className="text-xs text-slate-400 border border-slate-700 py-1 px-3 rounded-full hover:bg-slate-800 hover:text-white transition-colors"
           >
             Choose a template...
           </button>
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed self-end"
            disabled={isLoading || content.trim().length === 0}
          >
            {isLoading ? 'Sharing...' : 'Share Thought'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PostForm;