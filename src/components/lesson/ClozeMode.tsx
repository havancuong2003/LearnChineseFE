import { useState, useEffect } from 'react';

interface Sentence {
  _id: string;
  zh: string;
  vi: string;
  correctAnswer?: string;
}

interface ClozeModeProps {
  sentence: Sentence;
  onAnswer: (answer: string, correct: boolean) => void;
}

const ClozeMode = ({ sentence, onAnswer }: ClozeModeProps) => {
  const [hiddenWords, setHiddenWords] = useState<string[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isCorrect, setIsCorrect] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Split sentence into words and hide 1-2 random words
    const words = sentence.zh.split('').filter(char => char.trim() !== '');
    const hiddenCount = Math.min(2, Math.floor(words.length * 0.3));
    const randomIndices: number[] = [];
    
    while (randomIndices.length < hiddenCount) {
      const index = Math.floor(Math.random() * words.length);
      if (!randomIndices.includes(index)) {
        randomIndices.push(index);
      }
    }

    setHiddenWords(randomIndices.map(i => words[i]));
    // Create display with blanks
  }, [sentence]);

  const handleCheck = () => {
    if (checked) return;
    // Simple check: all hidden words should match
    let allCorrect = true;
    hiddenWords.forEach((word, index) => {
      if (userAnswers[index]?.trim() !== word.trim()) {
        allCorrect = false;
      }
    });
    setIsCorrect(allCorrect);
    setChecked(true);
    onAnswer(Object.values(userAnswers).join(', '), allCorrect);
  };

  const handleNext = () => {
    setUserAnswers({});
    setIsCorrect(false);
    setChecked(false);
    onAnswer('', false);
  };

  // Create display text with blanks
  const displayText = sentence.zh.split('').map((char, index) => {
    const hiddenIndex = hiddenWords.findIndex(() => {
      // Find which hidden word this character belongs to
      // This is simplified - you might want to improve the word detection
      return sentence.zh.indexOf(char) === index;
    });
    
    if (hiddenIndex >= 0) {
      return (
        <input
          key={index}
          type="text"
          value={userAnswers[hiddenIndex] || ''}
          onChange={(e) => setUserAnswers({ ...userAnswers, [hiddenIndex]: e.target.value })}
          className="inline-block w-12 mx-1 px-2 py-1 border-b-2 border-blue-500 text-center chinese-text"
          disabled={checked}
        />
      );
    }
    return <span key={index}>{char}</span>;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          Điền vào chỗ trống:
        </div>
        <div className="text-2xl font-bold chinese-text mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {displayText}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Gợi ý: {sentence.vi}
        </div>
      </div>

      {checked && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
          }`}
        >
          <div className={`text-center text-xl font-bold mb-2 ${isCorrect ? 'text-success' : 'text-error'}`}>
            {isCorrect ? '✓ Đúng' : '✗ Sai'}
          </div>
          <div className="text-center">Đáp án đúng: {sentence.zh}</div>
        </div>
      )}

      <div className="flex gap-4">
        {!checked ? (
          <button
            onClick={handleCheck}
            className="flex-1 px-4 py-3 bg-success text-white rounded-lg font-medium hover:bg-green-600 transition"
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

export default ClozeMode;

