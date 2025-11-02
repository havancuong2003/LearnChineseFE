import { useState } from 'react';
import HintHelper from './HintHelper';

interface Sentence {
  _id: string;
  zh: string;
  vi: string;
  correctAnswer?: string;
  pinyin?: string;
}

interface TranslateViToZhProps {
  sentence: Sentence;
  onAnswer: (answer: string, correct: boolean) => void;
}

const TranslateViToZh = ({ sentence, onAnswer }: TranslateViToZhProps) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleCheck = () => {
    if (checked) return;
    const correct = userAnswer.trim() === sentence.zh.trim();
    setIsCorrect(correct);
    setChecked(true);
    onAnswer(userAnswer.trim(), correct);
  };

  const handleNext = () => {
    setUserAnswer('');
    setIsCorrect(false);
    setChecked(false);
    onAnswer('', false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="text-2xl text-gray-700 dark:text-gray-300 mb-4">{sentence.vi}</div>
        <div className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          Dịch câu trên sang tiếng Trung:
        </div>
      </div>

      <div className="mb-4">
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Nhập câu tiếng Trung..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-success text-lg chinese-text dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={checked}
        />
      </div>

      {checked && (
        <>
          <div
            className={`p-4 rounded-lg mb-4 ${
              isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
            }`}
          >
            <div className={`text-center text-xl font-bold mb-2 ${isCorrect ? 'text-success' : 'text-error'}`}>
              {isCorrect ? '✓ Đúng' : '✗ Sai'}
            </div>
            <div className="text-center text-xl chinese-text">Đáp án đúng: {sentence.zh}</div>
          </div>
          {!isCorrect && (
            <HintHelper
              sentence={sentence}
              userAnswer={userAnswer}
              correctAnswer={sentence.zh}
              isCorrect={isCorrect}
            />
          )}
        </>
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

export default TranslateViToZh;

