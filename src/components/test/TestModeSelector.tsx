interface Mode {
  id: string;
  name: string;
  icon: string;
  description: string;
  count?: number;
  time?: number;
}

interface TestModeSelectorProps {
  selectedMode: string | null;
  onModeSelect: (mode: string, count?: number, time?: number) => void;
}

const modes: Mode[] = [
  {
    id: 'quick-test',
    name: 'Quick Test',
    icon: '⚡',
    description: '10 câu random từ bài vừa học',
    count: 10,
  },
  {
    id: 'classic-exam',
    name: 'Classic Exam',
    icon: '📝',
    description: '50 câu trộn, làm trong 20 phút',
    count: 50,
    time: 20 * 60,
  },
  {
    id: 'challenge-mode',
    name: 'Challenge Mode',
    icon: '🔥',
    description: 'Tăng dần độ khó, sai 3 lần sẽ kết thúc',
  },
  {
    id: 'random-reading',
    name: 'Random Reading Test',
    icon: '📖',
    description: 'Random 1 đoạn Reading Unit → 5 câu hỏi',
    count: 5,
  },
  {
    id: 'time-attack',
    name: 'Time Attack',
    icon: '⏱️',
    description: 'Đếm ngược từng câu, cộng điểm combo',
  },
];

const TestModeSelector = ({ selectedMode, onModeSelect }: TestModeSelectorProps) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Chọn hình thức thi</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeSelect(mode.id, mode.count, mode.time)}
            className={`p-6 border-2 rounded-lg text-left transition ${
              selectedMode === mode.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
            }`}
          >
            <div className="text-3xl mb-3">{mode.icon}</div>
            <div className="font-semibold text-lg mb-2">{mode.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{mode.description}</div>
            {mode.count && (
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {mode.count} câu
              </div>
            )}
            {mode.time && (
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {Math.floor(mode.time / 60)} phút
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TestModeSelector;

