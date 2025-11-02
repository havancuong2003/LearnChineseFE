import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import UnitSelector from '../components/vocabulary/UnitSelector';
import ModeSelector from '../components/vocabulary/ModeSelector';
import TypingMode from '../components/vocabulary/TypingMode';
import MultipleChoiceMode from '../components/vocabulary/MultipleChoiceMode';
import FlashcardMode from '../components/vocabulary/FlashcardMode';
import PinyinQuizMode from '../components/vocabulary/PinyinQuizMode';
import SpeedRoundMode from '../components/vocabulary/SpeedRoundMode';
import StreakMode from '../components/vocabulary/StreakMode';
import MatchGameMode from '../components/vocabulary/MatchGameMode';
import StatsDisplay from '../components/vocabulary/StatsDisplay';

interface Vocab {
  _id: string;
  zh: string;
  pinyin: string;
  vi: string;
  source_tag?: string;
}

const VocabularyStudy = () => {
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [orderMode, setOrderMode] = useState<'sequential' | 'random'>('sequential');
  const [studyMode, setStudyMode] = useState<string>('typing');
  const [vocabs, setVocabs] = useState<Vocab[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({ total: 0, correct: 0, incorrect: 0 });
  const [streak, setStreak] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  // Get all vocabs with selected units
  const { data: vocabsData, isLoading } = useQuery({
    queryKey: ['vocabs', selectedUnits.join(',')],
    queryFn: async () => {
      if (selectedUnits.length === 0) return [];
      const sourceTags = selectedUnits.join(',');
      const response = await api.get(`/vocabs?limit=1000&source_tags=${sourceTags}`);
      return response.data.vocabs as Vocab[];
    },
    enabled: selectedUnits.length > 0,
  });

  // Organize vocabs by unit and apply order mode
  useEffect(() => {
    if (!vocabsData || vocabsData.length === 0) {
      setVocabs([]);
      return;
    }

    let organizedVocabs: Vocab[] = [];

    if (orderMode === 'sequential') {
      // Lần lượt từng unit
      selectedUnits.forEach((unit) => {
        const unitVocabs = vocabsData.filter((v) => v.source_tag === unit);
        organizedVocabs = [...organizedVocabs, ...unitVocabs];
      });
    } else {
      // Random tất cả
      organizedVocabs = [...vocabsData].sort(() => 0.5 - Math.random());
    }

    setVocabs(organizedVocabs);
    setCurrentIndex(0);
  }, [vocabsData, selectedUnits, orderMode]);

  // Create session
  useEffect(() => {
    const createSession = async () => {
      if (!started) return;
      try {
        const response = await api.post('/sessions', { mode: 'vocab' });
        setSessionId(response.data._id);
      } catch (error) {
        console.error('Error creating session:', error);
      }
    };
    createSession();
  }, [started]);

  const currentVocab = vocabs[currentIndex];

  const handleAnswer = async (answer: string, correct: boolean) => {
    if (!currentVocab || !sessionId) return;

    // Update stats
    setStats((prev) => ({
      total: prev.total + 1,
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }));

    // Update streak
    if (correct) {
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    // Save answer
    try {
      await api.post('/sessions/answers', {
        sessionId,
        questionId: currentVocab._id,
        questionType: 'vocab',
        userAnswer: answer,
        correct,
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleNext = () => {
    if (currentIndex < vocabs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Complete session
      if (sessionId) {
        api.put(`/sessions/${sessionId}/complete`);
      }
      alert('Hoàn thành! Bạn đã học hết từ vựng.');
      setStarted(false);
      setCurrentIndex(0);
      setStats({ total: 0, correct: 0, incorrect: 0 });
      setStreak(0);
    }
  };

  const handleStart = () => {
    if (selectedUnits.length === 0) {
      alert('Vui lòng chọn ít nhất 1 unit');
      return;
    }
    if (vocabs.length === 0) {
      alert('Không có từ vựng trong unit đã chọn');
      return;
    }
    setStarted(true);
    setCurrentIndex(0);
    setStats({ total: 0, correct: 0, incorrect: 0 });
    setStreak(0);
  };

  if (!started) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Học Từ Vựng</h2>
        <UnitSelector
          selectedUnits={selectedUnits}
          onUnitsChange={setSelectedUnits}
          orderMode={orderMode}
          onOrderModeChange={setOrderMode}
        />
        <ModeSelector selectedMode={studyMode} onModeChange={setStudyMode} />
        <div className="text-center">
          <button
            onClick={handleStart}
            disabled={selectedUnits.length === 0 || vocabs.length === 0}
            className="px-8 py-3 bg-success text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
          >
            Bắt đầu học
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (!currentVocab) {
    return <div className="text-center py-8">Không có dữ liệu</div>;
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

      {studyMode === 'typing' && (
        <TypingMode vocab={currentVocab} onAnswer={handleAnswer} />
      )}

      {studyMode === 'multiple-choice' && (
        <MultipleChoiceMode vocab={currentVocab} allVocabs={vocabs} onAnswer={handleAnswer} />
      )}

      {studyMode === 'flashcard' && (
        <FlashcardMode vocab={currentVocab} onAnswer={handleAnswer} showFront="vi" />
      )}

      {studyMode === 'pinyin-quiz' && (
        <PinyinQuizMode vocab={currentVocab} allVocabs={vocabs} onAnswer={handleAnswer} />
      )}

      {studyMode === 'speed-round' && (
        <SpeedRoundMode
          vocab={currentVocab}
          onAnswer={handleAnswer}
          timeLimit={2}
          onTimeUp={handleNext}
        />
      )}

      {studyMode === 'streak-mode' && (
        <StreakMode vocab={currentVocab} onAnswer={handleAnswer} currentStreak={streak} />
      )}

      {studyMode === 'match-game' && (
        <MatchGameMode vocabs={vocabs} onAnswer={(answers, correct) => {
          handleAnswer('', correct);
          // For match game, each correct match counts
          const totalMatches = Object.keys(answers).length;
          const correctCount = Object.entries(answers).filter(([zh, vi]) => {
            const vocab = vocabs.find(v => v.zh === zh);
            return vocab && vocab.vi === vi;
          }).length;
          
          setStats((prev) => ({
            total: prev.total + totalMatches,
            correct: prev.correct + correctCount,
            incorrect: prev.incorrect + (totalMatches - correctCount),
          }));
        }} />
      )}

      <div className="mt-6">
        <StatsDisplay
          current={currentIndex + 1}
          total={vocabs.length}
          correct={stats.correct}
          incorrect={stats.incorrect}
          streak={studyMode === 'streak-mode' ? streak : undefined}
        />
      </div>

      {studyMode === 'speed-round' && (
        <div className="mt-4 text-center">
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Tiếp theo
          </button>
        </div>
      )}
    </div>
  );
};

export default VocabularyStudy;
