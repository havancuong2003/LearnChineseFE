import { useState } from 'react';

interface SentenceActionsProps {
  sentenceId: string;
  onMarkDifficult: (sentenceId: string, isDifficult: boolean) => void;
  onAddToReview: (sentenceId: string) => void;
  isDifficult?: boolean;
  inReview?: boolean;
}

const SentenceActions = ({
  sentenceId,
  onMarkDifficult,
  onAddToReview,
  isDifficult = false,
  inReview = false,
}: SentenceActionsProps) => {
  const [localIsDifficult, setLocalIsDifficult] = useState(isDifficult);
  const [localInReview, setLocalInReview] = useState(inReview);

  const handleMarkDifficult = () => {
    const newValue = !localIsDifficult;
    setLocalIsDifficult(newValue);
    onMarkDifficult(sentenceId, newValue);
  };

  const handleAddToReview = () => {
    if (!localInReview) {
      setLocalInReview(true);
      onAddToReview(sentenceId);
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={handleMarkDifficult}
        className={`px-3 py-1 text-sm rounded transition ${
          localIsDifficult
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        {localIsDifficult ? '⭐ Đã đánh dấu khó' : '📌 Đánh dấu câu khó'}
      </button>
      <button
        onClick={handleAddToReview}
        disabled={localInReview}
        className={`px-3 py-1 text-sm rounded transition ${
          localInReview
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
        } disabled:opacity-50`}
      >
        {localInReview ? '✓ Đã thêm vào Review List' : '📚 Thêm vào Review List'}
      </button>
    </div>
  );
};

export default SentenceActions;

