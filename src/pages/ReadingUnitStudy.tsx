import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import QuestionCard from '../components/reading/QuestionCard';

interface ReadingUnit {
  _id: string;
  unit_title: string;
  zh_paragraph: string;
  vi_paragraph: string;
}

interface ReadingQuestion {
  _id: string;
  question: string;
  questionContent?: string | { zh: string; vi: string };
  options?: string[];
  question_type: 'mcq' | 'fill' | 'translate';
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface QuestionResult {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
  question_type: string;
}

const ReadingUnitStudy = () => {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [showVietnamese, setShowVietnamese] = useState(false);

  const { data: units } = useQuery({
    queryKey: ['reading-units'],
    queryFn: async () => {
      const response = await api.get('/reading-units');
      return response.data as ReadingUnit[];
    },
  });

  const { data: questionsData } = useQuery({
    queryKey: ['reading-questions', selectedUnit],
    queryFn: async () => {
      if (!selectedUnit) return null;
      const response = await api.get(`/reading-units/${selectedUnit}/questions?count=10000`);
      return response.data as ReadingQuestion[];
    },
    enabled: !!selectedUnit,
  });

  const { data: unitData } = useQuery({
    queryKey: ['reading-unit', selectedUnit],
    queryFn: async () => {
      if (!selectedUnit) return null;
      const response = await api.get(`/reading-units/${selectedUnit}`);
      return response.data as { unit: ReadingUnit; questions: any[] };
    },
    enabled: !!selectedUnit,
  });

  const unit = unitData?.unit;
  const questions = questionsData || [];

  const handleAnswer = (questionId: string, answer: string) => {
    if (showResults) return;
    setSelectedAnswers({ ...selectedAnswers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    if (questions.length === 0) return;

    try {
      const response = await api.post(`/reading-units/${selectedUnit}/grade`, {
        answers: selectedAnswers
      });

      setScore(response.data.score);
      setCorrectCount(response.data.correctCount);
      setResults(response.data.results);
      setShowResults(true);
    } catch (error: any) {
      console.error('Lỗi chấm điểm:', error);
      alert(error.response?.data?.error || 'Có lỗi xảy ra khi chấm điểm');
    }
  };

  if (!selectedUnit) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Chọn Unit đọc hiểu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {units?.map((unit) => (
            <button
              key={unit._id}
              onClick={() => setSelectedUnit(unit._id)}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition text-left"
            >
              <h3 className="font-semibold text-lg">{unit.unit_title}</h3>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (!unit || !questions.length) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Reading Paragraph */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{unit.unit_title}</h3>
          <button
            onClick={() => setShowVietnamese(!showVietnamese)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
          >
            {showVietnamese ? 'Ẩn tiếng Việt' : 'Hiển thị tiếng Việt'}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Tiếng Trung:</h4>
            <p className="chinese-text text-lg leading-relaxed">{unit.zh_paragraph}</p>
          </div>
          {showVietnamese && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Tiếng Việt:</h4>
              <p className="text-lg leading-relaxed">{unit.vi_paragraph}</p>
            </div>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4 mb-6">
        {questions.map((question, index) => {
          const result = results.find(r => r.questionId === question._id);
          return (
            <QuestionCard
              key={question._id}
              question={question}
              index={index}
              selectedAnswer={selectedAnswers[question._id] || ''}
              onAnswer={handleAnswer}
              showResult={showResults}
              correct={result?.correct}
              correctAnswer={result?.correctAnswer}
            />
          );
        })}
      </div>

      {!showResults ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(selectedAnswers).length === 0}
          className="w-full px-4 py-3 bg-success text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Nộp bài ({Object.keys(selectedAnswers).length}/{questions.length})
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
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
            <div className="text-lg text-gray-600 dark:text-gray-400">
              Đúng: {correctCount}/{questions.length} câu
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">Chi tiết kết quả:</h3>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span>Đúng:</span>
                <span className="text-success font-semibold">{correctCount}</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span>Sai:</span>
                <span className="text-error font-semibold">{questions.length - correctCount}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setSelectedUnit(null);
                setSelectedAnswers({});
                setShowResults(false);
                setResults([]);
                setScore(0);
                setCorrectCount(0);
                setShowVietnamese(false);
              }}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Chọn Unit khác
            </button>
            <button
              onClick={() => {
                setSelectedAnswers({});
                setShowResults(false);
                setResults([]);
                setScore(0);
                setCorrectCount(0);
              }}
              className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-green-600 transition"
            >
              Làm lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingUnitStudy;

