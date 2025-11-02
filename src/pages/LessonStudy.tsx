import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import LessonModeSelector from '../components/lesson/LessonModeSelector';
import TranslateZhToVi from '../components/lesson/TranslateZhToVi';
import TranslateViToZh from '../components/lesson/TranslateViToZh';
import MultipleChoiceLessonMode from '../components/lesson/MultipleChoiceLessonMode';
import ClozeMode from '../components/lesson/ClozeMode';
import ArrangeWordsMode from '../components/lesson/ArrangeWordsMode';
import RolePlayMode from '../components/lesson/RolePlayMode';
import LineByLineDialogue from '../components/lesson/LineByLineDialogue';
import ReadingAssist from '../components/lesson/ReadingAssist';
import SentenceActions from '../components/lesson/SentenceActions';
import RelatedSentences from '../components/lesson/RelatedSentences';
import StatsDisplay from '../components/lesson/StatsDisplay';

interface Lesson {
  _id: string;
  title: string;
  description?: string;
  source_tag?: string;
  sentenceCount?: number;
}

interface Sentence {
  _id: string;
  zh: string;
  vi: string;
  options?: string[];
  correctAnswer?: string;
}

const LessonStudy = () => {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState<string>('zh-to-vi');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [stats, setStats] = useState({ total: 0, correct: 0, incorrect: 0 });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [sentencesData, setSentencesData] = useState<Sentence[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [difficultSentences, setDifficultSentences] = useState<Set<string>>(new Set());
  const [reviewList, setReviewList] = useState<Set<string>>(new Set());

  // Load lessons once
  const { data: lessons } = useQuery({
    queryKey: ['lessons'],
    queryFn: async () => {
      const response = await api.get('/lessons');
      return response.data as Lesson[];
    },
  });

  // Load sentences when lesson selected
  useEffect(() => {
    const loadSentences = async () => {
      if (selectedLesson) {
        try {
          const response = await api.get(`/lessons/${selectedLesson}`);
          const data = response.data as { lesson: Lesson; sentences: Sentence[] };
          setCurrentLesson(data.lesson);
          setSentencesData(data.sentences);
          setCurrentIndex(0);
          setStarted(false);
          setStats({ total: 0, correct: 0, incorrect: 0 });
          setStartTime(null);
        } catch (error) {
          console.error('Error loading sentences:', error);
        }
      } else {
        setSentencesData([]);
        setCurrentLesson(null);
      }
    };
    loadSentences();
  }, [selectedLesson]);

  const sentences = sentencesData;
  const currentSentence = sentences[currentIndex];

  const handleAnswer = (_answer: string, correct: boolean) => {
    setStats((prev) => ({
      total: prev.total + 1,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      alert('Hoàn thành bài học!');
      setStarted(false);
      setCurrentIndex(0);
      setStats({ total: 0, correct: 0, incorrect: 0 });
    }
  };

  const handleStart = () => {
    if (!selectedLesson) {
      alert('Vui lòng chọn bài khóa');
      return;
    }
    if (sentences.length === 0) {
      alert('Bài khóa này chưa có câu nào');
      return;
    }
    setStarted(true);
    setCurrentIndex(0);
    setStats({ total: 0, correct: 0, incorrect: 0 });
    setStartTime(Date.now());
  };

  const handleMarkDifficult = (sentenceId: string, isDifficult: boolean) => {
    setDifficultSentences(prev => {
      const newSet = new Set(prev);
      if (isDifficult) {
        newSet.add(sentenceId);
      } else {
        newSet.delete(sentenceId);
      }
      return newSet;
    });
  };

  const handleAddToReview = (sentenceId: string) => {
    setReviewList(prev => {
      const newSet = new Set(prev);
      newSet.add(sentenceId);
      return newSet;
    });
  };

  const handleSelectSentence = (sentenceId: string) => {
    const index = sentences.findIndex(s => s._id === sentenceId);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  };

  if (!selectedLesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Chọn bài khóa để học</h2>
        
        {!lessons || lessons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có bài khóa nào. Vui lòng thêm bài khóa từ trang Admin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <button
                key={lesson._id}
                onClick={() => setSelectedLesson(lesson._id)}
                className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition text-left border border-gray-200 dark:border-gray-700"
              >
                <h3 className="font-semibold text-lg mb-2">{lesson.title}</h3>
                {lesson.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {lesson.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-4">
                  {lesson.source_tag && (
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                      {lesson.source_tag}
                    </span>
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {lesson.sentenceCount || 0} câu
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={() => {
              setSelectedLesson(null);
              setCurrentIndex(0);
              setSentencesData([]);
              setCurrentLesson(null);
            }}
            className="text-blue-500 hover:text-blue-600"
          >
            ← Quay lại danh sách
          </button>
          {started && (
            <StatsDisplay stats={stats} startTime={startTime || undefined} />
          )}
        </div>

        <h2 className="text-2xl font-bold mb-6">{currentLesson?.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Số câu: {sentences.length}
        </p>

        <LessonModeSelector selectedMode={studyMode} onModeChange={setStudyMode} />

        <div className="text-center">
          <button
            onClick={handleStart}
            disabled={sentences.length === 0}
            className="px-8 py-3 bg-success text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
          >
            Bắt đầu học
          </button>
        </div>
      </div>
    );
  }

  if (!currentSentence) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-4">
        <button
          onClick={() => {
            setStarted(false);
            setCurrentIndex(0);
          }}
          className="text-blue-500 hover:text-blue-600"
        >
          ← Quay lại
        </button>
      </div>

      {studyMode === 'zh-to-vi' && (
        <TranslateZhToVi sentence={currentSentence} onAnswer={handleAnswer} />
      )}

      {studyMode === 'vi-to-zh' && (
        <TranslateViToZh sentence={currentSentence} onAnswer={handleAnswer} />
      )}

      {studyMode === 'multiple-choice' && (
        <MultipleChoiceLessonMode sentence={currentSentence} onAnswer={handleAnswer} />
      )}

      {studyMode === 'cloze' && (
        <ClozeMode sentence={currentSentence} onAnswer={handleAnswer} />
      )}

      {studyMode === 'arrange-words' && (
        <ArrangeWordsMode sentence={currentSentence} onAnswer={handleAnswer} />
      )}

      {studyMode === 'role-play' && (
        <RolePlayMode
          sentences={sentences}
          onComplete={(finalStats) => {
            setStats(finalStats);
            alert('Hoàn thành bài học!');
            setStarted(false);
            setCurrentIndex(0);
            setStats({ total: 0, correct: 0, incorrect: 0 });
          }}
        />
      )}

      {studyMode === 'line-by-line' && (
        <LineByLineDialogue
          sentences={sentences}
          currentIndex={currentIndex}
          onAnswer={handleAnswer}
          onNext={handleNext}
        />
      )}

      {studyMode === 'reading-assist' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold mb-4">📚 Reading Assist</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Hover vào từng từ để xem nghĩa:
          </p>
          <ReadingAssist sentence={currentSentence} />
          <div className="mt-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">Nghĩa câu:</p>
            <p className="text-lg">{currentSentence.vi}</p>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {currentIndex < sentences.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
            </button>
          </div>
        </div>
      )}

      {/* Sentence Actions for translation modes */}
      {(studyMode === 'zh-to-vi' || studyMode === 'vi-to-zh') && currentSentence && (
        <>
          <SentenceActions
            sentenceId={currentSentence._id}
            onMarkDifficult={handleMarkDifficult}
            onAddToReview={handleAddToReview}
            isDifficult={difficultSentences.has(currentSentence._id)}
            inReview={reviewList.has(currentSentence._id)}
          />
          <RelatedSentences
            currentSentence={currentSentence}
            allSentences={sentences}
            onSelectSentence={handleSelectSentence}
          />
        </>
      )}

      {/* Progress bar and stats */}
      {studyMode !== 'role-play' && studyMode !== 'line-by-line' && studyMode !== 'reading-assist' && (
        <>
          <div className="mt-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-sm mb-2">
              Câu {currentIndex + 1} / {sentences.length}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / sentences.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-center gap-4 text-sm">
              <span className="text-success">Đúng: {stats.correct}</span>
              <span className="text-error">Sai: {stats.incorrect}</span>
              <span>Tổng: {stats.total}</span>
            </div>
          </div>

          {/* Auto next for modes that don't have next button */}
          {studyMode === 'multiple-choice' && (
            <div className="mt-4 text-center">
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Tiếp theo
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LessonStudy;
