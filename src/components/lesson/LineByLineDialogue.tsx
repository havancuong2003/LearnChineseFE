import { useState } from 'react';

interface Sentence {
  _id: string;
  zh: string;
  vi: string;
  audio_url?: string;
}

interface LineByLineDialogueProps {
  sentences: Sentence[];
  currentIndex: number;
  onAnswer: (answer: string, correct: boolean) => void;
  onNext: () => void;
}

const LineByLineDialogue = ({ sentences, currentIndex, onAnswer, onNext }: LineByLineDialogueProps) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  const currentSentence = sentences[currentIndex];

  const handleCheck = () => {
    if (!userAnswer.trim()) return;
    
    const isCorrect = userAnswer.trim().toLowerCase() === currentSentence.zh.trim().toLowerCase();
    setShowAnswer(true);
    onAnswer(userAnswer.trim(), isCorrect);
  };

  const handleNextClick = () => {
    setUserAnswer('');
    setShowAnswer(false);
    onNext();
  };

  const handleRepeat = () => {
    // Placeholder for audio playback
    if (currentSentence.audio_url) {
      // Play audio
      const audio = new Audio(currentSentence.audio_url);
      audio.play().catch(console.error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">💬 Line-by-line Dialogue</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Luyện nói từng câu
        </p>
      </div>

      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="mb-4">
          <div className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Câu {currentIndex + 1} / {sentences.length}
          </div>
          <div className="chinese-text text-2xl mb-2">{currentSentence.zh}</div>
          <div className="text-lg text-gray-600 dark:text-gray-400">{currentSentence.vi}</div>
        </div>

        {currentSentence.audio_url && (
          <button
            onClick={handleRepeat}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            🔊 Repeat After Me
          </button>
        )}
      </div>

      {!showAnswer && (
        <div className="mb-4">
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Nhập lại câu này..."
            rows={2}
            className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleCheck}
            disabled={!userAnswer.trim()}
            className="mt-2 w-full px-4 py-2 bg-success text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
          >
            Kiểm tra
          </button>
        </div>
      )}

      {showAnswer && (
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
          <button
            onClick={handleNextClick}
            className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
          >
            Câu tiếp theo
          </button>
        </div>
      )}
    </div>
  );
};

export default LineByLineDialogue;

