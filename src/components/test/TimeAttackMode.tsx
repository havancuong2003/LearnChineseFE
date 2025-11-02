import { useState, useEffect } from 'react';

interface Question {
  id: string;
  type: 'vocab' | 'sentence' | 'reading';
  question: string;
  pinyin?: string;
  options?: string[];
  correctAnswer: string;
}

interface TimeAttackModeProps {
  questions: Question[];
  onAnswer: (questionId: string, answer: string) => void;
  onComplete: (result: { score: number; total: number; correct: number; incorrect: number; time: number }) => void;
}

const TimeAttackMode = ({ questions, onAnswer, onComplete }: TimeAttackModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState(15); // seconds
  const [timeRemaining, setTimeRemaining] = useState(timePerQuestion);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (!currentQuestion) return;
    
    setTimeRemaining(timePerQuestion);
    setQuestionStartTime(Date.now());
    
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - move to next
          handleAnswer('', false);
          return timePerQuestion;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, timePerQuestion]);

  const handleAnswer = (answer: string, isCorrect?: boolean) => {
    if (!currentQuestion) return;
    
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const wasCorrect = isCorrect !== undefined 
      ? isCorrect 
      : answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    
    setAnswers({ ...answers, [currentQuestion.id]: answer });
    onAnswer(currentQuestion.id, answer);
    
    if (wasCorrect) {
      // Increase combo and score (faster = more points)
      const newCombo = combo + 1;
      setCombo(newCombo);
      const timeBonus = Math.max(1, Math.floor(timePerQuestion - timeTaken));
      const comboBonus = newCombo * 10;
      setScore(score + 10 + timeBonus + comboBonus);
      
      // Faster time for next question
      setTimePerQuestion(Math.max(5, timePerQuestion - 0.5));
    } else {
      // Reset combo
      setCombo(0);
    }
    
    // Next question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed
      const totalTime = (Date.now() - startTime) / 1000;
      const correctCount = Object.keys(answers).filter(k => {
        const q = questions.find(q => q.id === k);
        return q && answers[k].trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      }).length + (wasCorrect ? 1 : 0);
      
      onComplete({
        score,
        total: questions.length,
        correct: correctCount,
        incorrect: questions.length - correctCount,
        time: totalTime,
      });
    }
  };

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm">
          Câu {currentIndex + 1} / {questions.length}
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            Combo: {combo}x
          </div>
          <div className="text-xl font-bold text-warning">{timeRemaining}s</div>
        </div>
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAnswer(e.currentTarget.value);
              }
            }}
            placeholder="Nhập câu trả lời (Enter để nộp)..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            autoFocus
          />
        )}
      </div>

      <div className="text-center text-lg font-bold text-success">
        Điểm: {score}
      </div>
    </div>
  );
};

export default TimeAttackMode;

