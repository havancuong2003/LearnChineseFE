import { useState, useEffect } from 'react';
import api from '../utils/api';
import LessonSelector from '../components/lesson/LessonSelector';
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

interface Sentence {
  _id: string;
  zh: string;
  vi: string;
  options?: string[];
  correctAnswer?: string;
  lessonId?: string | { _id: string; title?: string; description?: string; source_tag?: string };
}

const LessonStudy = () => {
  const [studyMode, setStudyMode] = useState<string>('zh-to-vi');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [stats, setStats] = useState({ total: 0, correct: 0, incorrect: 0 });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [orderMode, setOrderMode] = useState<'sequential' | 'random'>('sequential');
  const [allSentences, setAllSentences] = useState<Record<string, Sentence[]>>({}); // lessonId -> sentences
  const [sentencesData, setSentencesData] = useState<Sentence[]>([]);
  const [difficultSentences, setDifficultSentences] = useState<Set<string>>(new Set());
  const [reviewList, setReviewList] = useState<Set<string>>(new Set());

  // Load all sentences and group by lessonId (NO /lessons API call)
  useEffect(() => {
    const loadAllData = async () => {
      try {
        // Load all sentences directly from database
        // Try different endpoints to get sentences
        let allSentencesList: Sentence[] = [];
        
        // Load all sentences from /sentences endpoint (NO /lessons API call)
        const response = await api.get('/sentences?limit=10000');
        allSentencesList = response.data.sentences || response.data || [];

        // Group sentences by lessonId
        const sentencesMap: Record<string, Sentence[]> = {};

        for (const sentence of allSentencesList) {
          let lessonId: string | undefined;
          
          if (typeof sentence.lessonId === 'object' && sentence.lessonId !== null) {
            // Populated lesson object
            lessonId = (sentence.lessonId as any)._id || (sentence.lessonId as any).id || String(sentence.lessonId);
          } else if (sentence.lessonId) {
            // Direct lessonId string or ObjectId
            lessonId = String(sentence.lessonId);
          }
          
          if (lessonId) {
            // Normalize lessonId (remove any extra formatting)
            const normalizedLessonId = lessonId.toString();
            if (!sentencesMap[normalizedLessonId]) {
              sentencesMap[normalizedLessonId] = [];
            }
            sentencesMap[normalizedLessonId].push(sentence);
          }
        }
        
        console.log('Loaded sentences map:', Object.keys(sentencesMap).length, 'lessons');

        setAllSentences(sentencesMap);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadAllData();
  }, []);

  // Organize sentences based on selected lessons and order mode
  useEffect(() => {
    if (selectedLessons.length === 0) {
      setSentencesData([]);
      return;
    }

    if (Object.keys(allSentences).length === 0) {
      // Data chưa load xong
      setSentencesData([]);
      return;
    }

    let organizedSentences: Sentence[] = [];

    // Normalize lessonIds và match với allSentences
    selectedLessons.forEach((lessonId) => {
      const normalizedId = String(lessonId);
      const lessonSentences = allSentences[normalizedId] || [];
      
      // Nếu không tìm thấy, thử tìm với các format khác
      if (lessonSentences.length === 0) {
        // Try finding by matching any key
        for (const key in allSentences) {
          if (key.toString() === normalizedId || key.includes(normalizedId) || normalizedId.includes(key)) {
            organizedSentences = [...organizedSentences, ...allSentences[key]];
            break;
          }
        }
      } else {
        organizedSentences = [...organizedSentences, ...lessonSentences];
      }
    });

    if (orderMode === 'random') {
      organizedSentences = organizedSentences.sort(() => 0.5 - Math.random());
    }

    console.log('Organized sentences:', organizedSentences.length, 'from', selectedLessons.length, 'lessons');
    setSentencesData(organizedSentences);
    setCurrentIndex(0);
    setStarted(false);
    setStats({ total: 0, correct: 0, incorrect: 0 });
    setStartTime(null);
  }, [selectedLessons, orderMode, allSentences]);

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
    if (selectedLessons.length === 0) {
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

  if (!started) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Học Bài Khóa</h2>
        
        <LessonSelector
          selectedLessons={selectedLessons}
          onLessonsChange={setSelectedLessons}
          orderMode={orderMode}
          onOrderModeChange={setOrderMode}
        />
        
        <LessonModeSelector selectedMode={studyMode} onModeChange={setStudyMode} />

        <div className="text-center">
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {selectedLessons.length > 0 && (
              <div>
                Đã chọn: {selectedLessons.length} bài
                {sentencesData.length > 0 && ` (${sentencesData.length} câu)`}
                {sentencesData.length === 0 && ' - Đang tải câu...'}
              </div>
            )}
          </div>
          <button
            onClick={handleStart}
            disabled={selectedLessons.length === 0 || sentencesData.length === 0}
            className="px-8 py-3 bg-success text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
          >
            Bắt đầu học
          </button>
          {selectedLessons.length > 0 && sentencesData.length === 0 && (
            <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
              Các bài đã chọn chưa có câu hoặc đang tải dữ liệu...
            </div>
          )}
        </div>
      </div>
    );
  }


  if (!currentSentence) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
      <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => {
            setStarted(false);
            setCurrentIndex(0);
          }}
          className="text-blue-500 hover:text-blue-600"
        >
          ← Quay lại
        </button>
        {started && (
          <StatsDisplay stats={stats} startTime={startTime || undefined} />
        )}
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
