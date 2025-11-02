import { useState, useEffect } from 'react';
import ReadingQuestionContent from './ReadingQuestionContent';

interface Question {
  id: string;
  type: 'vocab' | 'sentence' | 'reading';
  question: string;
  pinyin?: string;
  options?: string[];
  correctAnswer: string;
  questionContent?: string | { zh: string; vi: string }; // For reading questions
  questionType?: 'mcq' | 'fill' | 'translate'; // For reading questions
}

interface TimeAttackModeProps {
  questions: Question[];
  onAnswer: (questionId: string, answer: string) => void;
  onComplete: (result: { score: number; total: number; correct: number; incorrect: number; time: number }) => void;
  onBack?: () => void;
}

const TimeAttackMode = ({ questions, onAnswer, onComplete, onBack }: TimeAttackModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timePerQuestion, setTimePerQuestion] = useState(15); // seconds
  const [timeRemaining, setTimeRemaining] = useState(timePerQuestion);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (answer: string, isCorrect?: boolean) => {
    if (!currentQuestion) return;
    
    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const wasCorrect = isCorrect !== undefined 
      ? isCorrect 
      : answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);
    onAnswer(currentQuestion.id, answer);
    
    let newScore = score;
    let newCombo = combo;
    
    if (wasCorrect) {
      // Increase combo and score (faster = more points)
      newCombo = combo + 1;
      setCombo(newCombo);
      const timeBonus = Math.max(1, Math.floor(timePerQuestion - timeTaken));
      const comboBonus = newCombo * 10;
      newScore = score + 10 + timeBonus + comboBonus;
      setScore(newScore);
      
      // Faster time for next question
      setTimePerQuestion((prev) => Math.max(5, prev - 0.5));
    } else {
      // Reset combo
      setCombo(0);
      newCombo = 0;
    }
    
    // Next question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed
      const totalTime = (Date.now() - startTime) / 1000;
      const correctCount = Object.keys(newAnswers).filter(k => {
        const q = questions.find(q => q.id === k);
        return q && newAnswers[k].trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      }).length;
      
      onComplete({
        score: newScore,
        total: questions.length,
        correct: correctCount,
        incorrect: questions.length - correctCount,
        time: totalTime,
      });
    }
  };

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
  }, [currentIndex, timePerQuestion, currentQuestion]);

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-4 flex justify-between items-center">
        {onBack && (
          <button
            onClick={onBack}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            ← Quay lại
          </button>
        )}
        <div className="flex-1 flex justify-between items-center ml-4">
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
      </div>

      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-2">
          Loại: {currentQuestion.type === 'vocab' ? 'Từ vựng' : currentQuestion.type === 'sentence' ? 'Bài khóa' : 'Đọc hiểu'}
        </div>
        
        {/* Hiển thị questionContent cho reading questions */}
        {currentQuestion.type === 'reading' && currentQuestion.questionContent && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {currentQuestion.questionType === 'mcq' && typeof currentQuestion.questionContent === 'object' ? (
              <ReadingQuestionContent 
                zh={currentQuestion.questionContent.zh} 
                vi={currentQuestion.questionContent.vi} 
              />
            ) : typeof currentQuestion.questionContent === 'string' ? (
              <div className="text-lg leading-relaxed">{currentQuestion.questionContent}</div>
            ) : null}
          </div>
        )}
        
        {/* Hiển thị question text (cho các loại khác hoặc reading không có questionContent) */}
        {(!currentQuestion.questionContent || currentQuestion.type !== 'reading') && (
          <div className="text-xl font-semibold mb-4">{currentQuestion.question}</div>
        )}
        
        {/* Chỉ hiển thị pinyin khi có options (multiple choice), không hiển thị khi nhập tiếng Trung */}
        {currentQuestion.pinyin && currentQuestion.options && currentQuestion.options.length > 0 && (
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

