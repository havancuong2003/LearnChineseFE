import { useState } from 'react';

interface Vocab {
  _id: string;
  zh: string;
  pinyin: string;
  vi: string;
  source_tag?: string;
}

interface FlashcardModeProps {
  vocab: Vocab;
  onAnswer: (answer: string, correct: boolean) => void;
  showFront: 'vi' | 'zh';
}

const FlashcardMode = ({ vocab, onAnswer, showFront = 'vi' }: FlashcardModeProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [checked, setChecked] = useState(false);

  const frontText = showFront === 'vi' ? vocab.vi : vocab.zh;
  const backText = showFront === 'vi' ? vocab.zh : vocab.vi;
  const frontLabel = showFront === 'vi' ? 'Tiếng Việt' : 'Tiếng Trung';
  const backLabel = showFront === 'vi' ? 'Tiếng Trung' : 'Tiếng Việt';

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setUserAnswer(backText);
      setIsCorrect(true);
      setChecked(true);
      onAnswer(backText, true);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setUserAnswer('');
    setIsCorrect(false);
    setChecked(false);
    onAnswer('', false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="text-center mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{frontLabel}</div>
        <div
          className="text-3xl font-bold chinese-text mb-4 p-8 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition min-h-[200px] flex items-center justify-center"
          onClick={handleFlip}
        >
          {!isFlipped ? frontText : backText}
        </div>
        {!isFlipped && (
          <button
            onClick={handleFlip}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Lật thẻ để xem {backLabel}
          </button>
        )}
      </div>

      {isFlipped && (
        <div className="mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{backLabel}</div>
          <div className="text-2xl font-bold chinese-text text-center p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
            {backText}
          </div>
          {/* Không hiển thị pinyin khi hiển thị đáp án tiếng Trung */}
        </div>
      )}

      {isFlipped && (
        <button
          onClick={handleNext}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
        >
          Tiếp theo
        </button>
      )}
    </div>
  );
};

export default FlashcardMode;

