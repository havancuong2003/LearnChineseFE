import { useState } from 'react';

interface Vocab {
  _id: string;
  zh: string;
  pinyin: string;
  vi: string;
  source_tag?: string;
}

interface TypingModeProps {
  vocab: Vocab;
  onAnswer: (answer: string, correct: boolean) => void;
}

const TypingMode = ({ vocab, onAnswer }: TypingModeProps) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleCheck = () => {
    if (checked) return;
    const correct = userAnswer.trim() === vocab.zh.trim();
    setIsCorrect(correct);
    setChecked(true);
    onAnswer(userAnswer.trim(), correct);
  };

  const handleNext = () => {
    setUserAnswer('');
    setIsCorrect(false);
    setChecked(false);
    onAnswer('', false); // Reset callback
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        {/* Không hiển thị pinyin khi yêu cầu nhập tiếng Trung */}
        <div className="text-xl text-gray-700 dark:text-gray-300">{vocab.vi}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Dịch từ trên sang tiếng Trung
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !checked && handleCheck()}
          placeholder="Nhập từ tiếng Trung..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-success text-lg chinese-text dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={checked}
        />
      </div>

      {checked && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
          }`}
        >
          <div className={`text-center text-2xl font-bold mb-2 ${isCorrect ? 'text-success' : 'text-error'}`}>
            {isCorrect ? '✓ Đúng' : '✗ Sai'}
          </div>
          <div className="text-center text-xl chinese-text">Đáp án: {vocab.zh}</div>
        </div>
      )}

      <div className="flex gap-4">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={!userAnswer.trim()}
            className="flex-1 px-4 py-3 bg-success text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
          >
            Kiểm tra
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
          >
            Tiếp theo
          </button>
        )}
      </div>
    </div>
  );
};

export default TypingMode;

