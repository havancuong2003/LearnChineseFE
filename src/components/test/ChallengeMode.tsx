import { useState, useEffect } from 'react';

interface Question {
  id: string;
  type: 'vocab' | 'sentence' | 'reading';
  question: string;
  pinyin?: string;
  options?: string[];
  correctAnswer: string;
}

interface ChallengeModeProps {
  questions: Question[];
  onAnswer: (questionId: string, answer: string) => void;
  onComplete: (result: { score: number; total: number; correct: number; incorrect: number }) => void;
}

const ChallengeMode = ({ questions, onAnswer, onComplete }: ChallengeModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [wrongCount, setWrongCount] = useState(0);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [timePerQuestion, setTimePerQuestion] = useState(30); // seconds
  const [timeRemaining, setTimeRemaining] = useState(timePerQuestion);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (!currentQuestion) return;
    
    setTimeRemaining(timePerQuestion);
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - count as wrong
          handleAnswer('');
          return timePerQuestion;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, timePerQuestion]);

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;
    
    const isCorrect = answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    
    setAnswers({ ...answers, [currentQuestion.id]: answer });
    onAnswer(currentQuestion.id, answer);
    
    if (isCorrect) {
      // Increase score and difficulty
      setScore(score + difficulty);
      setDifficulty(difficulty + 0.5);
      setTimePerQuestion(Math.max(10, timePerQuestion - 1)); // Faster time
      
      // Next question
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Completed
        onComplete({ score: score + difficulty, total: questions.length, correct: Object.keys(answers).length + 1, incorrect: wrongCount });
      }
    } else {
      // Wrong answer - increase wrong count
      const newWrongCount = wrongCount + 1;
      setWrongCount(newWrongCount);
      
      if (newWrongCount >= 3) {
        // Game over
        onComplete({ score, total: currentIndex + 1, correct: Object.keys(answers).filter(k => {
          const q = questions.find(q => q.id === k);
          return q && answers[k].trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
        }).length, incorrect: wrongCount });
      } else {
        // Continue with harder difficulty
        setTimePerQuestion(Math.max(5, timePerQuestion - 2));
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      }
    }
  };

  if (!currentQuestion || wrongCount >= 3) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <div className="text-3xl font-bold text-error mb-4">Game Over!</div>
        <div className="text-lg mb-4">
          Bạn đã sai 3 lần. Điểm: {score}
        </div>
        <button
          onClick={() => onComplete({ score, total: currentIndex, correct: score, incorrect: wrongCount })}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Xem kết quả
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm">
          Câu {currentIndex + 1} / {questions.length} | Độ khó: {difficulty.toFixed(1)}x | Sai: {wrongCount}/3
        </div>
        <div className="text-xl font-bold text-warning">{timeRemaining}s</div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-2">
          Loại: {currentQuestion.type === 'vocab' ? 'Từ vựng' : currentQuestion.type === 'sentence' ? 'Bài khóa' : 'Đọc hiểu'}
        </div>
        <div className="text-xl font-semibold mb-4">{currentQuestion.question}</div>
        {currentQuestion.pinyin && (
          <div className="text-gray-600 dark:text-gray-400 mb-2">Pinyin: {currentQuestion.pinyin}</div>
        )}

        {currentQuestion.options && currentQuestion.options.length > 0 ? (
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className="w-full p-3 rounded-lg text-left bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            onChange={(e) => {
              // Auto submit on Enter
              if (e.key === 'Enter') {
                handleAnswer(e.target.value);
              }
            }}
            onBlur={(e) => {
              if (e.target.value.trim()) {
                handleAnswer(e.target.value);
              }
            }}
            placeholder="Nhập câu trả lời..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            autoFocus
          />
        )}
      </div>

      <div className="text-center text-sm text-gray-500">
        Điểm: {score} | Combo: {difficulty.toFixed(1)}x
      </div>
    </div>
  );
};

export default ChallengeMode;

