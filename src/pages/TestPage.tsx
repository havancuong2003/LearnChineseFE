import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import TestModeSelector from '../components/test/TestModeSelector';
import ChallengeMode from '../components/test/ChallengeMode';
import TimeAttackMode from '../components/test/TimeAttackMode';
import RandomReadingTest from '../components/test/RandomReadingTest';
import ReadingQuestionContent from '../components/test/ReadingQuestionContent';
import { generateTest, gradeTest } from '../utils/testGenerator';

interface ReadingQuestion {
  _id: string;
  question: string;
  options?: string[];
  answer: { text: string } | string;
  question_type: 'mcq' | 'fill' | 'translate';
}

interface ReadingUnit {
  _id: string;
  unit_title: string;
  zh_paragraph: string;
  vi_paragraph: string;
}

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

interface TestResult {
  score: number;
  total: number;
  correct: number;
  incorrect: number;
  breakdown: {
    vocab: { total: number; correct: number };
    sentence: { total: number; correct: number };
    reading: { total: number; correct: number };
  };
  results: Array<{
    questionId: string;
    questionType: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    correct: boolean;
  }>;
}

const TestPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [started, setStarted] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(20 * 60); // 20 minutes
  const [randomReadingUnit, setRandomReadingUnit] = useState<ReadingUnit | null>(null);
  const [randomReadingQuestions, setRandomReadingQuestions] = useState<ReadingQuestion[]>([]);

  // Load data once
  const { data: vocabs } = useQuery({
    queryKey: ['vocabs'],
    queryFn: async () => {
      const response = await api.get('/vocabs?limit=10000');
      // Handle both { vocabs: [] } and [] formats
      return Array.isArray(response.data) ? response.data : (response.data.vocabs || []);
    },
  });

  const { data: sentences } = useQuery({
    queryKey: ['sentences'],
    queryFn: async () => {
      // Load all sentences from /sentences endpoint (NO /lessons API call)
      const response = await api.get('/sentences?limit=10000');
      // Handle both { sentences: [] } and [] formats
      return Array.isArray(response.data) ? response.data : (response.data.sentences || []);
    },
  });

  const { data: readingQuestions } = useQuery({
    queryKey: ['reading-questions'],
    queryFn: async () => {
      const unitsResponse = await api.get('/reading-units');
      const units = unitsResponse.data as ReadingUnit[];
      const allQuestions: ReadingQuestion[] = [];

      for (const unit of units) {
        try {
          const questionsResponse = await api.get(`/reading-units/${unit._id}/questions?count=100`);
          const questions = questionsResponse.data;
          
          // Populate unitId với unit data (zh_paragraph, vi_paragraph)
          const questionsWithUnit = questions.map((q: any) => ({
            ...q,
            unitId: {
              _id: unit._id,
              zh_paragraph: unit.zh_paragraph,
              vi_paragraph: unit.vi_paragraph,
              unit_title: unit.unit_title,
            }
          }));
          
          allQuestions.push(...questionsWithUnit);
        } catch (error) {
          console.error(`Error loading questions for unit ${unit._id}:`, error);
        }
      }

      return allQuestions;
    },
  });

  const { data: readingUnits } = useQuery({
    queryKey: ['reading-units'],
    queryFn: async () => {
      const response = await api.get('/reading-units');
      return response.data as ReadingUnit[];
    },
  });

  const handleModeSelect = (mode: string, count?: number, time?: number) => {
    if (!vocabs || !sentences || !readingQuestions) {
      alert('Đang tải dữ liệu... Vui lòng đợi');
      return;
    }

    if (mode === 'random-reading') {
      // Random 1 unit and get 5 questions
      if (!readingUnits || readingUnits.length === 0) {
        alert('Chưa có Reading Unit nào');
        return;
      }
      const randomUnit = readingUnits[Math.floor(Math.random() * readingUnits.length)];
      setRandomReadingUnit(randomUnit);
      
      // Get questions for this unit
      api.get(`/reading-units/${randomUnit._id}/questions?count=5`)
        .then((response) => {
          setRandomReadingQuestions(response.data);
          setSelectedMode(mode);
          setStarted(true);
          setCurrentIndex(0);
          setAnswers({});
          setResult(null);
        })
        .catch(console.error);
      return;
    }

    const testCount = count || 50;
    const testTime = time || 20 * 60;
    
    // Generate test on frontend
    const generatedQuestions = generateTest(
      vocabs,
      sentences,
      readingQuestions,
      testCount,
      0.4,
      0.3,
      0.3
    );

    setQuestions(generatedQuestions);
    setSelectedMode(mode);
    setStarted(true);
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    setTimeRemaining(testTime);
    setRandomReadingUnit(null);
    setRandomReadingQuestions([]);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (questions.length === 0) return;
    if (window.confirm('Bạn có chắc muốn nộp bài? Sau khi nộp không thể sửa lại.')) {
      // Grade test on frontend
      const gradedResult = gradeTest(questions, answers);
      setResult(gradedResult);
    }
  };

  // Timer (only for classic-exam and quick-test)
  useEffect(() => {
    if (!started || result || !selectedMode || (selectedMode !== 'classic-exam' && selectedMode !== 'quick-test')) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [started, result, selectedMode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!started && !result) {
    return (
      <div>
        <TestModeSelector selectedMode={selectedMode} onModeSelect={handleModeSelect} />
      </div>
    );
  }

  if (result) {
    const scoreColor =
      result.score >= 80 ? 'text-success' : result.score >= 60 ? 'text-warning' : 'text-error';
    const scoreBg =
      result.score >= 80 ? 'bg-green-100 dark:bg-green-900/30' : result.score >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30';

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Kết Quả Bài Kiểm Tra</h2>

        <div className={`${scoreBg} rounded-lg p-6 mb-6 text-center`}>
          <div className={`text-4xl font-bold mb-2 ${scoreColor}`}>Điểm: {result.score}/100</div>
          <div className="text-lg">
            Đúng: {result.correct} / {result.total} câu
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Breakdown theo dạng câu:</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="font-semibold">Từ vựng</div>
              <div className="text-2xl font-bold">
                {result.breakdown.vocab.correct}/{result.breakdown.vocab.total}
              </div>
              <div className="text-sm text-gray-600">
                {result.breakdown.vocab.total > 0
                  ? Math.round((result.breakdown.vocab.correct / result.breakdown.vocab.total) * 100)
                  : 0}%
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
              <div className="font-semibold">Bài khóa</div>
              <div className="text-2xl font-bold">
                {result.breakdown.sentence.correct}/{result.breakdown.sentence.total}
              </div>
              <div className="text-sm text-gray-600">
                {result.breakdown.sentence.total > 0
                  ? Math.round((result.breakdown.sentence.correct / result.breakdown.sentence.total) * 100)
                  : 0}%
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="font-semibold">Đọc hiểu</div>
              <div className="text-2xl font-bold">
                {result.breakdown.reading.correct}/{result.breakdown.reading.total}
              </div>
              <div className="text-sm text-gray-600">
                {result.breakdown.reading.total > 0
                  ? Math.round((result.breakdown.reading.correct / result.breakdown.reading.total) * 100)
                  : 0}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Chi tiết câu sai:</h3>
          <div className="space-y-4">
            {result.results
              .filter((r) => !r.correct)
              .map((r, index) => (
                <div key={index} className="border-l-4 border-error p-4 bg-red-50 dark:bg-red-900/20">
                  <div className="font-semibold mb-2">{r.question}</div>
                  <div className="text-sm">
                    <div className="text-error">Bạn trả lời: {r.userAnswer}</div>
                    <div className="text-success">Đáp án đúng: {r.correctAnswer}</div>
                  </div>
                </div>
              ))}
            {result.results.filter((r) => !r.correct).length === 0 && (
              <p className="text-center text-success">Tuyệt vời! Bạn trả lời đúng tất cả!</p>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setStarted(false);
              setResult(null);
              setQuestions([]);
              setAnswers({});
              setSelectedMode(null);
              setRandomReadingUnit(null);
              setRandomReadingQuestions([]);
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Làm lại bài test
          </button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    if (window.confirm('Bạn có chắc muốn quay lại? Tiến trình hiện tại sẽ bị mất.')) {
      setStarted(false);
      setResult(null);
      setQuestions([]);
      setAnswers({});
      setSelectedMode(null);
      setRandomReadingUnit(null);
      setRandomReadingQuestions([]);
      setCurrentIndex(0);
    }
  };

  // Handle special modes
  if (selectedMode === 'challenge-mode' && started && !result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ChallengeMode
          questions={questions}
          onAnswer={handleAnswer}
          onBack={handleBack}
          onComplete={(result) => {
            // Convert challenge result to test result format
            const gradedResult = gradeTest(questions, answers);
            setResult({
              ...gradedResult,
              score: Math.round((result.correct / result.total) * 100),
              correct: result.correct,
              incorrect: result.incorrect,
            });
          }}
        />
      </div>
    );
  }

  if (selectedMode === 'time-attack' && started && !result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <TimeAttackMode
          questions={questions}
          onAnswer={handleAnswer}
          onBack={handleBack}
          onComplete={(result) => {
            const gradedResult = gradeTest(questions, answers);
            setResult({
              ...gradedResult,
              score: Math.round((result.correct / result.total) * 100),
              correct: result.correct,
              incorrect: result.incorrect,
            });
          }}
        />
      </div>
    );
  }

  if (selectedMode === 'random-reading' && started && randomReadingUnit && randomReadingQuestions.length > 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <RandomReadingTest
          unit={randomReadingUnit}
          questions={randomReadingQuestions.map(q => ({
            _id: q._id,
            question: q.question,
            options: q.options,
            question_type: q.question_type,
            correctAnswer: typeof q.answer === 'object' ? q.answer.text : q.answer || '',
          }))}
          onBack={handleBack}
          onComplete={(result) => {
            const breakdown = {
              vocab: { total: 0, correct: 0 },
              sentence: { total: 0, correct: 0 },
              reading: { total: result.total, correct: result.correct },
            };
            setResult({
              score: result.score,
              total: result.total,
              correct: result.correct,
              incorrect: result.incorrect,
              breakdown,
              results: [],
            });
          }}
        />
      </div>
    );
  }

  // Default classic exam / quick test mode
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id || ''] || '';

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p>Đang tải câu hỏi...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="text-blue-500 hover:text-blue-600 text-sm mb-2"
          >
            ← Quay lại
          </button>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div>
            Câu {currentIndex + 1} / {questions.length}
          </div>
          {(selectedMode === 'classic-exam' || selectedMode === 'quick-test') && (
            <div className="text-xl font-bold text-warning">{formatTime(timeRemaining)}</div>
          )}
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">
            Loại: {currentQuestion?.type === 'vocab' ? 'Từ vựng' : currentQuestion?.type === 'sentence' ? 'Bài khóa' : 'Đọc hiểu'}
          </div>
          
          {/* Hiển thị questionContent cho reading questions */}
          {currentQuestion?.type === 'reading' && currentQuestion?.questionContent && (
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
          {(!currentQuestion?.questionContent || currentQuestion?.type !== 'reading') && (
            <div className="text-xl font-semibold mb-4">{currentQuestion?.question}</div>
          )}
          
          {/* Chỉ hiển thị pinyin khi có options (multiple choice), không hiển thị khi nhập tiếng Trung */}
          {currentQuestion?.pinyin && currentQuestion?.options && currentQuestion.options.length > 0 && (
            <div className="text-gray-600 dark:text-gray-400 mb-2">Pinyin: {currentQuestion.pinyin}</div>
          )}

          {currentQuestion?.options && currentQuestion.options.length > 0 ? (
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(currentQuestion.id, option)}
                  className={`w-full p-3 rounded-lg text-left transition ${
                    currentAnswer === option
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
              value={currentAnswer}
              onChange={(e) => handleAnswer(currentQuestion?.id || '', e.target.value)}
              placeholder="Nhập câu trả lời..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          )}
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
          >
            ← Trước
          </button>
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
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

        <div className="mt-4">
          <div className="text-sm mb-2">Tiến độ:</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;

