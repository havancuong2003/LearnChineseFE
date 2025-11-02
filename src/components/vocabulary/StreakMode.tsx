import { useState } from 'react';
import TypingMode from './TypingMode';

interface Vocab {
  _id: string;
  zh: string;
  pinyin: string;
  vi: string;
  source_tag?: string;
}

interface StreakModeProps {
  vocab: Vocab;
  onAnswer: (answer: string, correct: boolean) => void;
  currentStreak: number;
}

const StreakMode = ({ vocab, onAnswer, currentStreak }: StreakModeProps) => {
  const [streakLost, setStreakLost] = useState(false);

  const handleAnswer = (answer: string, correct: boolean) => {
    if (!correct) {
      setStreakLost(true);
    }
    onAnswer(answer, correct);
  };

  if (streakLost) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">💥</div>
          <div className="text-2xl font-bold text-error mb-2">Streak bị mất!</div>
          <div className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Bạn đã giữ được {currentStreak} câu đúng liên tiếp
          </div>
          <button
            onClick={() => {
              setStreakLost(false);
              onAnswer('', false);
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Tiếp tục học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-warning">🔥 Streak: {currentStreak}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Trả lời sai sẽ reset streak về 0
        </div>
      </div>
      <TypingMode vocab={vocab} onAnswer={handleAnswer} />
    </div>
  );
};

export default StreakMode;

