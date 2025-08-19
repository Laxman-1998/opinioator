// components/ReportModal.tsx
import { useState } from 'react';
import toast from 'react-hot-toast';

type ReportModalProps = {
  open: boolean;
  onClose: () => void;
  commentId: number | null;
  onReported: () => void;
};

const REPORT_REASONS = [
  'Spam',
  'Harassment',
  'Hate Speech',
  'Violence',
  'Personal Info',
  'Other',
];

const ReportModal = ({ open, onClose, commentId, onReported }: ReportModalProps) => {
  const [reason, setReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open || commentId == null) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason for reporting.');
      return;
    }
    setIsSubmitting(true);

    try {
      // Replace with your API call
      const response = await fetch('/api/reportComment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          reason,
          additionalInfo,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to report comment.');
      }

      toast.success('Thank you for reporting. Our team will review the comment.');
      setReason('');
      setAdditionalInfo('');
      onReported();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Reporting failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-slate-900 rounded-lg px-6 py-5 max-w-xs w-full border border-slate-800 relative">
        <h2 className="font-bold text-lg text-slate-200 mb-2">Report Comment</h2>
        <form onSubmit={handleSubmit}>
          <label className="block text-slate-400 mb-1 text-sm font-semibold">
            Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded px-2 py-2 mb-2"
            disabled={isSubmitting}
          >
            <option value="">Select reason</option>
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <label className="block text-slate-400 mb-1 text-sm font-semibold">
            Details (optional)
          </label>
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Add more info (optional)"
            className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded px-2 py-2 mb-4"
            rows={2}
            disabled={isSubmitting}
          />

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded bg-slate-700 text-slate-200 text-xs"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-yellow-500 text-white text-xs font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Reporting...' : 'Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
