import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import { useAuth } from '../lib/auth';
import TemplatePicker from './TemplatePicker'; // Import our new component

type PostFormProps = {
  onPostSuccess: () => void;
};

const PostForm = ({ onPostSuccess }: PostFormProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [labelDisagree, setLabelDisagree] = useState('Disagree');
  const [labelAgree, setLabelAgree] = useState('Agree');
  const [isLoading, setIsLoading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false); // New state for the modal

  const handleSubmit = async (event: React.FormEvent) => {
    // ... This function remains exactly the same
    event.preventDefault();
    if (!user) {
      toast.error("You must be logged in to post.");
      return;
    }
    if (content.trim().length === 0) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert([{ content, user_id: user.id, label_agree: labelAgree, label_disagree: labelDisagree }]);
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
    <>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col gap-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-28 p-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-500"
            placeholder="What's on your mind?..."
            disabled={isLoading}
          />
          <div className="flex items-center gap-4">
            <input type="text" value={labelDisagree} onChange={(e) => setLabelDisagree(e.target.value)} className="w-full p-2 text-sm bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none placeholder:text-slate-500 text-center" maxLength={30} />
            <input type="text" value={labelAgree} onChange={(e) => setLabelAgree(e.target.value)} className="w-full p-2 text-sm bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none placeholder:text-slate-500 text-center" maxLength={30} />
          </div>
           {/* New button to open the template picker */}
          <div className="flex justify-between items-center">
             <button 
                type="button" 
                onClick={() => setIsPickerOpen(true)}
                className="text-xs text-slate-400 hover:text-white transition-colors"
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
      {/* Render our new TemplatePicker modal */}
      <TemplatePicker 
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(disagree, agree) => {
          setLabelDisagree(disagree);
          setLabelAgree(agree);
        }}
      />
    </>
  );
};

export default PostForm;