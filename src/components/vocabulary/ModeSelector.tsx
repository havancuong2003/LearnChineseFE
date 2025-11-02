interface Mode {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface ModeSelectorProps {
  selectedMode: string;
  onModeChange: (mode: string) => void;
}

const modes: Mode[] = [
  { id: 'typing', name: 'Gõ lại từ', icon: '⌨️', description: 'Hiển thị nghĩa → gõ lại từ tiếng Trung' },
  { id: 'multiple-choice', name: 'Chọn đáp án', icon: '2️⃣', description: 'Hiển thị nghĩa → 4 lựa chọn' },
  { id: 'flashcard', name: 'Flashcard', icon: '3️⃣', description: 'Lật thẻ để xem nghĩa' },
  { id: 'pinyin-quiz', name: 'Pinyin Quiz', icon: '4️⃣', description: 'Chọn hoặc gõ pinyin đúng' },
  { id: 'match-game', name: 'Match Game', icon: '🧩', description: 'Kéo thả ghép từ Trung ↔ nghĩa Việt' },
  { id: 'speed-round', name: 'Speed Round', icon: '⏱️', description: '20 câu, 2s/câu, phản xạ nhanh' },
  { id: 'streak-mode', name: 'Streak Mode', icon: '🔥', description: 'Giữ chuỗi đúng, sai sẽ reset' },
];

const ModeSelector = ({ selectedMode, onModeChange }: ModeSelectorProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Chọn chế độ học</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`p-4 border-2 rounded-lg text-left transition ${
              selectedMode === mode.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
            }`}
          >
            <div className="text-2xl mb-2">{mode.icon}</div>
            <div className="font-semibold mb-1">{mode.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{mode.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;

