import { useState } from 'react';

interface Sentence {
  _id: string;
  zh: string;
  vi: string;
  options?: string[];
  correctAnswer?: string;
}

interface MultipleChoiceLessonModeProps {
  sentence: Sentence;
  onAnswer: (answer: string, correct: boolean) => void;
}

const MultipleChoiceLessonMode = ({ sentence, onAnswer }: MultipleChoiceLessonModeProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [checked, setChecked] = useState(false);

  const options = sentence.options || [];
  const correctAnswer = sentence.correctAnswer || sentence.vi;

  const handleSelectOption = (option: string) => {
    if (checked) return;
    setSelectedOption(option);
  };

  const handleCheck = () => {
    if (checked || !selectedOption) return;
    const correct = selectedOption === correctAnswer;
    setIsCorrect(correct);
    setChecked(true);
    onAnswer(selectedOption, correct);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsCorrect(false);
    setChecked(false);
    onAnswer('', false);
  };

  if (options.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">Câu này chưa có đáp án trắc nghiệm. Vui lòng chọn chế độ khác.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="text-2xl font-bold chinese-text mb-4">{sentence.zh}</div>
        <div className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          Chọn bản dịch đúng:
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {options.map((option, index) => {
          let bgColor = 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
          if (checked) {
            if (option === correctAnswer) {
              bgColor = 'bg-success/20 border-2 border-success';
            } else if (selectedOption === option && !isCorrect) {
              bgColor = 'bg-error/20 border-2 border-error';
            }
          } else if (selectedOption === option) {
            bgColor = 'bg-blue-100 dark:bg-blue-900/30';
          }

          return (
            <button
              key={index}
              onClick={() => handleSelectOption(option)}
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
          <div className={`text-center text-xl font-bold mb-2 ${isCorrect ? 'text-success' : 'text-error'}`}>
            {isCorrect ? '✓ Đúng' : '✗ Sai'}
          </div>
          <div className="text-center">Đáp án đúng: {correctAnswer}</div>
        </div>
      )}

      <div className="flex gap-4">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={!selectedOption}
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

export default MultipleChoiceLessonMode;

