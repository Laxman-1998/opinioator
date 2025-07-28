import { motion, AnimatePresence } from 'framer-motion';

// This defines the structure of our onSelect function prop
type TemplatePickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (disagree: string, agree: string) => void;
};

// This is our list of pre-made templates
const templates = [
  { name: 'Standard', disagree: 'Disagree', agree: 'Agree' },
  { name: 'Validation', disagree: `It'll be okay`, agree: `You're not alone` },
  { name: 'Decision', disagree: 'Be Cautious', agree: 'Go for it!' },
  { name: 'Ethical', disagree: 'This is wrong', agree: 'This is right' },
];

const TemplatePicker = ({ isOpen, onClose, onSelect }: TemplatePickerProps) => {
  const handleSelect = (disagree: string, agree: string) => {
    onSelect(disagree, agree);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-lg p-6"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h3 className="text-lg font-bold text-white mb-4">Choose a Template</h3>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.name}
                  onClick={() => handleSelect(template.disagree, template.agree)}
                  className="text-left p-3 bg-slate-800 rounded-md hover:bg-slate-700 transition-colors"
                >
                  <span className="font-semibold text-white">{template.name}</span>
                  <div className="text-xs mt-1">
                    <span className="text-red-400">{template.disagree}</span> / <span className="text-green-400">{template.agree}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TemplatePicker;