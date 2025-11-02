import { useState, useEffect } from 'react';

interface Sentence {
  _id: string;
  zh: string;
  vi: string;
}

interface ArrangeWordsModeProps {
  sentence: Sentence;
  onAnswer: (answer: string, correct: boolean) => void;
}

const ArrangeWordsMode = ({ sentence, onAnswer }: ArrangeWordsModeProps) => {
  const [words, setWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Split sentence into words and shuffle
    const sentenceWords = sentence.zh.split(/\s+/).filter((w) => w.trim());
    const shuffled = [...sentenceWords].sort(() => 0.5 - Math.random());
    setWords(shuffled);
    setSelectedWords([]);
    setChecked(false);
    setIsCorrect(false);
  }, [sentence]);

  const handleWordClick = (word: string, index: number) => {
    if (checked) return;
    
    // Move word from words to selectedWords
    const newWords = words.filter((_, i) => i !== index);
    setWords(newWords);
    setSelectedWords([...selectedWords, word]);
  };

  const handleSelectedClick = (word: string, index: number) => {
    if (checked) return;
    
    // Move word back from selectedWords to words
    const newSelected = selectedWords.filter((_, i) => i !== index);
    setSelectedWords(newSelected);
    setWords([...words, word]);
  };

  const handleCheck = () => {
    if (checked) return;
    const userAnswer = selectedWords.join(' ');
    const correct = userAnswer === sentence.zh;
    setIsCorrect(correct);
    setChecked(true);
    onAnswer(userAnswer, correct);
  };

  const handleNext = () => {
    setSelectedWords([]);
    setIsCorrect(false);
    setChecked(false);
    onAnswer('', false);
    // Reset words
    const sentenceWords = sentence.zh.split(/\s+/).filter((w) => w.trim());
    const shuffled = [...sentenceWords].sort(() => 0.5 - Math.random());
    setWords(shuffled);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="text-xl text-gray-700 dark:text-gray-300 mb-4">{sentence.vi}</div>
        <div className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          Sắp xếp các từ sau thành câu đúng:
        </div>
      </div>

      {/* Selected words area */}
      <div className="mb-4 min-h-[100px] p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Câu của bạn:</div>
        <div className="flex flex-wrap gap-2">
          {selectedWords.map((word, index) => (
            <button
              key={index}
              onClick={() => handleSelectedClick(word, index)}
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 chinese-text font-medium"
              disabled={checked}
            >
              {word}
            </button>
          ))}
          {selectedWords.length === 0 && (
            <span className="text-gray-400 dark:text-gray-500 italic">Kéo hoặc click từ bên dưới</span>
          )}
        </div>
      </div>

      {/* Available words */}
      <div className="mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Từ có sẵn:</div>
        <div className="flex flex-wrap gap-2">
          {words.map((word, index) => (
            <button
              key={`${word}-${index}`}
              onClick={() => handleWordClick(word, index)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 chinese-text font-medium"
              disabled={checked}
            >
              {word}
            </button>
          ))}
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
          <div className="text-center text-xl chinese-text">Đáp án đúng: {sentence.zh}</div>
        </div>
      )}

      <div className="flex gap-4">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selectedWords.length === 0}
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

export default ArrangeWordsMode;

