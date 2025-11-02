import { useState, useEffect } from 'react';

interface Vocab {
  _id: string;
  zh: string;
  pinyin: string;
  vi: string;
  source_tag?: string;
}

interface PinyinQuizModeProps {
  vocab: Vocab;
  allVocabs: Vocab[];
  onAnswer: (answer: string, correct: boolean) => void;
}

const PinyinQuizMode = ({ vocab, allVocabs, onAnswer }: PinyinQuizModeProps) => {
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Generate 4 options: 1 correct + 3 random
    const otherVocabs = allVocabs.filter((v) => v._id !== vocab._id);
    const randomVocabs = otherVocabs.sort(() => 0.5 - Math.random()).slice(0, 3);
    const randomOptions = randomVocabs.map((v) => v.pinyin);
    const allOptions = [vocab.pinyin, ...randomOptions].sort(() => 0.5 - Math.random());
    setOptions(allOptions);
  }, [vocab, allVocabs]);

  const handleSelect = (option: string) => {
    if (checked) return;
    setSelectedAnswer(option);
  };

  const handleCheck = () => {
    if (checked || !selectedAnswer) return;
    const correct = selectedAnswer.trim().toLowerCase() === vocab.pinyin.trim().toLowerCase();
    setIsCorrect(correct);
    setChecked(true);
    onAnswer(selectedAnswer, correct);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsCorrect(false);
    setChecked(false);
    // Regenerate options
    const otherVocabs = allVocabs.filter((v) => v._id !== vocab._id);
    const randomVocabs = otherVocabs.sort(() => 0.5 - Math.random()).slice(0, 3);
    const randomOptions = randomVocabs.map((v) => v.pinyin);
    const allOptions = [vocab.pinyin, ...randomOptions].sort(() => 0.5 - Math.random());
    setOptions(allOptions);
    onAnswer('', false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <div className="text-3xl font-bold chinese-text mb-2">{vocab.zh}</div>
        <div className="text-lg text-gray-600 dark:text-gray-400">Chọn pinyin đúng:</div>
      </div>

      <div className="space-y-3 mb-4">
        {options.map((option, index) => {
          let bgColor = 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
          if (checked) {
            if (option.trim().toLowerCase() === vocab.pinyin.trim().toLowerCase()) {
              bgColor = 'bg-green-100 dark:bg-green-900/30 border-2 border-success';
            } else if (selectedAnswer === option && !isCorrect) {
              bgColor = 'bg-red-100 dark:bg-red-900/30 border-2 border-error';
            }
          } else if (selectedAnswer === option) {
            bgColor = 'bg-blue-100 dark:bg-blue-900/30';
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              className={`w-full p-4 rounded-lg text-left transition ${bgColor}`}
              disabled={checked}
            >
              {option}
            </button>
          );
        })}
      </div>

      {checked && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
          }`}
        >
          <div className={`text-center text-xl font-bold ${isCorrect ? 'text-success' : 'text-error'}`}>
            {isCorrect ? '✓ Đúng' : '✗ Sai'}
          </div>
          <div className="text-center mt-2">Đáp án: {vocab.pinyin}</div>
          <div className="text-center text-gray-600 dark:text-gray-400 mt-2">Nghĩa: {vocab.vi}</div>
        </div>
      )}

      <div className="flex gap-4">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={!selectedAnswer}
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

export default PinyinQuizMode;

