import { useState } from 'react';

interface Question {
  _id: string;
  question: string;
  questionContent?: string | { zh: string; vi: string };
  options?: string[];
  question_type: 'mcq' | 'fill' | 'translate';
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface QuestionCardProps {
  question: Question;
  index: number;
  selectedAnswer: string;
  onAnswer: (questionId: string, answer: string) => void;
  showResult?: boolean;
  correct?: boolean;
  correctAnswer?: string;
}

const QuestionCard = ({
  question,
  index,
  selectedAnswer,
  onAnswer,
  showResult = false,
  correct,
  correctAnswer,
}: QuestionCardProps) => {
  const [showVietnamese, setShowVietnamese] = useState(false);
  const getTypeLabel = () => {
    switch (question.question_type) {
      case 'mcq':
        return 'Trắc nghiệm';
      case 'fill':
        return 'Điền từ';
      case 'translate':
        return 'Dịch';
      default:
        return 'Câu hỏi';
    }
  };

  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${
        showResult && correct !== undefined
          ? correct
            ? 'border-2 border-success'
            : 'border-2 border-error'
          : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-lg">
          Câu {index + 1}: {question.question}
        </div>
        <div className="flex gap-2 items-center">
          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor()}`}>
            {question.difficulty || 'medium'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getTypeLabel()}
          </span>
        </div>
      </div>

      {/* Hiển thị questionContent cho fill và mcq */}
      {question.questionContent && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {question.question_type === 'mcq' && typeof question.questionContent === 'object' ? (
            <div className="space-y-3">
              <div>
                <div className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Tiếng Trung:</div>
                <div className="chinese-text text-lg">{question.questionContent.zh}</div>
              </div>
              {showVietnamese && (
                <div className="border-t pt-3">
                  <div className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Tiếng Việt:</div>
                  <div className="text-lg">{question.questionContent.vi}</div>
                </div>
              )}
              <button
                onClick={() => setShowVietnamese(!showVietnamese)}
                className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                {showVietnamese ? 'Ẩn tiếng Việt' : 'Hiển thị tiếng Việt'}
              </button>
            </div>
          ) : typeof question.questionContent === 'string' ? (
            <div className="text-lg leading-relaxed">
              {question.questionContent}
            </div>
          ) : null}
        </div>
      )}

      {question.question_type === 'mcq' && question.options && question.options.length > 0 ? (
        <div className="space-y-2">
          {question.options.map((option, optIndex) => {
            let bgColor = 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
            if (showResult && correct !== undefined) {
              if (option === correctAnswer) {
                bgColor = 'bg-green-100 dark:bg-green-900/30 border-2 border-success';
              } else if (selectedAnswer === option && !correct) {
                bgColor = 'bg-red-100 dark:bg-red-900/30 border-2 border-error';
              }
            } else if (selectedAnswer === option) {
              bgColor = 'bg-blue-100 dark:bg-blue-900/30';
            }

            return (
              <button
                key={optIndex}
                onClick={() => onAnswer(question._id, option)}
                className={`w-full p-3 rounded-lg text-left transition ${bgColor}`}
                disabled={showResult}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : question.question_type === 'translate' ? (
        <textarea
          value={selectedAnswer}
          onChange={(e) => onAnswer(question._id, e.target.value)}
          placeholder="Nhập bản dịch..."
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={showResult}
        />
      ) : (
        <input
          type="text"
          value={selectedAnswer}
          onChange={(e) => onAnswer(question._id, e.target.value)}
          placeholder="Nhập câu trả lời..."
          className="w-full p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={showResult}
        />
      )}

      {showResult && correct !== undefined && correctAnswer && (
        <div
          className={`mt-4 p-3 rounded-lg ${
            correct ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
          }`}
        >
          <div className={`text-sm font-semibold mb-1 ${correct ? 'text-success' : 'text-error'}`}>
            {correct ? '✓ Đúng' : '✗ Sai'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Đáp án đúng: {correctAnswer}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;

