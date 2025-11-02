import { useState } from 'react';

interface ReadingQuestionContentProps {
  zh: string;
  vi: string;
}

const ReadingQuestionContent = ({ zh, vi }: ReadingQuestionContentProps) => {
  const [showVietnamese, setShowVietnamese] = useState(false);

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Tiếng Trung:</div>
        <div className="chinese-text text-lg leading-relaxed">{zh}</div>
      </div>
      {showVietnamese && (
        <div className="border-t pt-3">
          <div className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Tiếng Việt:</div>
          <div className="text-lg leading-relaxed">{vi}</div>
        </div>
      )}
      <button
        onClick={() => setShowVietnamese(!showVietnamese)}
        className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        {showVietnamese ? 'Ẩn tiếng Việt' : 'Hiển thị tiếng Việt'}
      </button>
    </div>
  );
};

export default ReadingQuestionContent;

