import { useState, useEffect } from 'react';
import api from '../../utils/api';

interface Lesson {
  _id: string;
  title: string;
  description?: string;
  source_tag?: string;
  sentenceCount?: number;
}

interface LessonSelectorProps {
  selectedLessons: string[];
  onLessonsChange: (lessons: string[]) => void;
  orderMode: 'sequential' | 'random';
  onOrderModeChange: (mode: 'sequential' | 'random') => void;
}

const LessonSelector = ({
  selectedLessons,
  onLessonsChange,
  orderMode,
  onOrderModeChange,
}: LessonSelectorProps) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLessons = async () => {
      try {
        // Load sentences and group by lessonId
        const response = await api.get('/sentences?limit=10000');
        const sentences = response.data.sentences || response.data || [];
        
        // Group sentences by lessonId
        const lessonMap = new Map<string, { lesson: Lesson; sentences: any[] }>();
        
        for (const sentence of sentences) {
          if (sentence.lessonId) {
            let lessonId: string;
            
            if (typeof sentence.lessonId === 'object' && sentence.lessonId !== null) {
              // Populated lesson object
              lessonId = String((sentence.lessonId as any)._id || (sentence.lessonId as any).id || sentence.lessonId);
            } else {
              // Direct lessonId string or ObjectId
              lessonId = String(sentence.lessonId);
            }
            
            if (!lessonMap.has(lessonId)) {
              const lessonData = typeof sentence.lessonId === 'object' ? sentence.lessonId : null;
              lessonMap.set(lessonId, {
                lesson: {
                  _id: lessonId,
                  title: (lessonData as any)?.title || `Bài ${lessonId.substring(0, 8)}`,
                  description: (lessonData as any)?.description,
                  source_tag: (lessonData as any)?.source_tag,
                  sentenceCount: 0,
                },
                sentences: [],
              });
            }
            const entry = lessonMap.get(lessonId);
            if (entry) {
              entry.sentences.push(sentence);
              entry.lesson.sentenceCount = (entry.lesson.sentenceCount || 0) + 1;
            }
          }
        }
        
        console.log('LessonSelector: Loaded', lessonMap.size, 'lessons from sentences');

        const lessonsList = Array.from(lessonMap.values()).map(entry => entry.lesson);
        setLessons(lessonsList);
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, []);

  const handleToggleLesson = (lessonId: string) => {
    if (selectedLessons.includes(lessonId)) {
      onLessonsChange(selectedLessons.filter(id => id !== lessonId));
    } else {
      onLessonsChange([...selectedLessons, lessonId]);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Đang tải bài khóa...</div>;
  }

  if (lessons.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500">Chưa có bài khóa nào</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Chọn bài khóa</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Chế độ học:</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="sequential"
              checked={orderMode === 'sequential'}
              onChange={(e) => onOrderModeChange(e.target.value as 'sequential' | 'random')}
              className="mr-2"
            />
            Lần lượt từng bài
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="random"
              checked={orderMode === 'random'}
              onChange={(e) => onOrderModeChange(e.target.value as 'sequential' | 'random')}
              className="mr-2"
            />
            Random trong các bài đã chọn
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {lessons.map((lesson) => (
          <button
            key={lesson._id}
            onClick={() => handleToggleLesson(lesson._id)}
            className={`p-4 border-2 rounded-lg text-left transition ${
              selectedLessons.includes(lesson._id)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-semibold mb-1">{lesson.title}</div>
                {lesson.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {lesson.description}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {lesson.source_tag && (
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                      {lesson.source_tag}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {lesson.sentenceCount || 0} câu
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selectedLessons.includes(lesson._id)}
                onChange={() => {}}
                className="ml-2"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </button>
        ))}
      </div>

      {selectedLessons.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Đã chọn: {selectedLessons.length} bài
        </div>
      )}
    </div>
  );
};

export default LessonSelector;

