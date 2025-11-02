import { useState } from 'react';

interface ReadingUnit {
  _id: string;
  unit_title: string;
  zh_paragraph: string;
  vi_paragraph: string;
}

interface ReadingQuestion {
  _id: string;
  question: string;
  options?: string[];
  question_type: 'mcq' | 'fill' | 'translate';
  correctAnswer: string;
}

interface RandomReadingTestProps {
  unit: ReadingUnit;
  questions: ReadingQuestion[];
  onComplete: (result: { score: number; total: number; correct: number; incorrect: number }) => void;
  onBack?: () => void;
}

const RandomReadingTest = ({ unit, questions, onComplete, onBack }: RandomReadingTestProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Vui lòng trả lời tất cả câu hỏi');
      return;
    }

    let correct = 0;
    questions.forEach((q) => {
      const userAnswer = answers[q._id] || '';
      const correctAnswer = q.correctAnswer || '';
      
      let isCorrect = false;
      if (q.question_type === 'mcq') {
        isCorrect = userAnswer.trim() === correctAnswer.trim();
      } else {
        isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
      }
      
      if (isCorrect) correct++;
    });

    const totalScore = Math.round((correct / questions.length) * 100);
    setScore(totalScore);
    setCorrectCount(correct);
    setShowResults(true);
    
    onComplete({
      score: totalScore,
      total: questions.length,
      correct,
      incorrect: questions.length - correct,
    });
  };

  if (showResults) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-4 text-blue-500 hover:text-blue-600 text-sm"
          >
            ← Quay lại
          </button>
        )}
        <div className={`text-center py-6 rounded-lg mb-6 ${
          score >= 80 ? 'bg-green-100 dark:bg-green-900/30' :
          score >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
          'bg-red-100 dark:bg-red-900/30'
        }`}>
          <div className={`text-4xl font-bold mb-2 ${
            score >= 80 ? 'text-success' :
            score >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-error'
          }`}>
            Điểm: {score}%
          </div>
          <div className="text-lg">
            Đúng: {correctCount} / {questions.length} câu
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-2xl font-bold">📖 Random Reading Test</h3>
        {onBack && (
          <button
            onClick={onBack}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            ← Quay lại
          </button>
        )}
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-semibold mb-2">{unit.unit_title}</h4>
        <div className="chinese-text text-lg mb-2">{unit.zh_paragraph}</div>
        <div className="text-lg">{unit.vi_paragraph}</div>
      </div>

      <div className="mb-4">
        <div className="text-sm mb-2">
          Câu {currentIndex + 1} / {questions.length}
        </div>
        <div className="text-xl font-semibold mb-4">{currentQuestion?.question}</div>

        {currentQuestion?.options && currentQuestion.options.length > 0 ? (
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(currentQuestion._id, option)}
                className={`w-full p-3 rounded-lg text-left transition ${
                  answers[currentQuestion._id] === option
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={answers[currentQuestion?._id] || ''}
            onChange={(e) => handleAnswer(currentQuestion?._id || '', e.target.value)}
            placeholder="Nhập câu trả lời..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
        >
          ← Trước
        </button>
        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Sau →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-success text-white rounded-lg hover:bg-green-600"
          >
            Nộp bài
          </button>
        )}
      </div>
    </div>
  );
};

export default RandomReadingTest;

