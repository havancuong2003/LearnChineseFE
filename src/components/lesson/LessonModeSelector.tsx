interface Mode {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface LessonModeSelectorProps {
  selectedMode: string;
  onModeChange: (mode: string) => void;
}

const modes: Mode[] = [
  { id: 'zh-to-vi', name: 'Dịch ZH → VI', icon: '1️⃣', description: 'Hiển thị câu tiếng Trung → nhập bản dịch tiếng Việt' },
  { id: 'vi-to-zh', name: 'Dịch VI → ZH', icon: '2️⃣', description: 'Hiển thị câu tiếng Việt → nhập câu tiếng Trung' },
  { id: 'multiple-choice', name: 'Chọn đáp án', icon: '3️⃣', description: 'Hiển thị câu → 4 lựa chọn' },
  { id: 'cloze', name: 'Cloze (Điền chỗ trống)', icon: '🧠', description: 'Ẩn 1-2 từ trong câu → điền vào đúng chỗ' },
  { id: 'arrange-words', name: 'Arrange Words', icon: '🧩', description: 'Sắp xếp từ xáo trộn thành câu đúng' },
  { id: 'role-play', name: 'Role Play', icon: '🎭', description: 'Hệ thống đóng vai người đối thoại' },
  { id: 'line-by-line', name: 'Line-by-line Dialogue', icon: '💬', description: 'Luyện nói từng câu với audio' },
  { id: 'reading-assist', name: 'Reading Assist', icon: '📚', description: 'Hiển thị nghĩa khi hover từ' },
];

const LessonModeSelector = ({ selectedMode, onModeChange }: LessonModeSelectorProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Chọn chế độ học bài khóa</h3>
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

export default LessonModeSelector;

