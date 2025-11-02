import { useState } from 'react';

interface Sentence {
  _id: string;
  zh: string;
  vi: string;
}

interface RolePlayModeProps {
  sentences: Sentence[];
  onComplete: (stats: { total: number; correct: number; incorrect: number }) => void;
}

const RolePlayMode = ({ sentences, onComplete }: RolePlayModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showCorrect, setShowCorrect] = useState(false);
  const [stats, setStats] = useState({ total: 0, correct: 0, incorrect: 0 });

  const currentSentence = sentences[currentIndex];
  const rolePrompt = sentences[currentIndex]?.zh || '';

  const handleCheck = () => {
    if (!userAnswer.trim()) return;
    
    const isCorrect = userAnswer.trim().toLowerCase() === currentSentence.zh.trim().toLowerCase();
    setShowCorrect(true);
    
    setStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setShowCorrect(false);
    } else {
      onComplete(stats);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">🎭 Role Play Mode</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Hệ thống: <span className="chinese-text text-lg">{rolePrompt}</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Bạn hãy nhập câu trả lời:
        </p>
      </div>

      <div className="mb-4">
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Nhập câu trả lời của bạn..."
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={showCorrect}
        />
      </div>

      {showCorrect && (
        <div className={`mb-4 p-4 rounded-lg ${
          userAnswer.trim().toLowerCase() === currentSentence.zh.trim().toLowerCase()
            ? 'bg-green-100 dark:bg-green-900/30'
            : 'bg-red-100 dark:bg-red-900/30'
        }`}>
          <div className={`font-semibold mb-2 ${
            userAnswer.trim().toLowerCase() === currentSentence.zh.trim().toLowerCase()
              ? 'text-success'
              : 'text-error'
          }`}>
            {userAnswer.trim().toLowerCase() === currentSentence.zh.trim().toLowerCase() ? '✓ Đúng' : '✗ Sai'}
          </div>
          <div className="text-sm">
            <div className="mb-1">Đáp án đúng: <span className="chinese-text font-semibold">{currentSentence.zh}</span></div>
            <div>Nghĩa: {currentSentence.vi}</div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {!showCorrect ? (
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
            {currentIndex < sentences.length - 1 ? 'Tiếp theo' : 'Hoàn thành'}
          </button>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Câu {currentIndex + 1} / {sentences.length}
      </div>
    </div>
  );
};

export default RolePlayMode;

