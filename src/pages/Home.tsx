import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      title: 'Học từ vựng',
      description: 'Luyện từ vựng theo nhiều chế độ: Gõ lại, Chọn đáp án, Flashcard, Pinyin Quiz, Speed Round, Streak Mode',
      path: '/vocabulary',
      color: 'bg-blue-500',
      icon: '📝',
    },
    {
      title: 'Bài khóa',
      description: 'Dịch ZH↔VI, Cloze, Arrange Words, Multiple Choice - Nhiều chế độ học bài khóa',
      path: '/lessons',
      color: 'bg-purple-500',
      icon: '📖',
    },
    {
      title: 'Đọc hiểu',
      description: 'Đọc đoạn văn và trả lời câu hỏi trắc nghiệm/điền từ/dịch',
      path: '/reading',
      color: 'bg-green-500',
      icon: '📚',
    },
    {
      title: 'Kiểm tra',
      description: 'Bài test 45-50 câu hỗn hợp từ vựng + bài khóa + đọc hiểu',
      path: '/test',
      color: 'bg-orange-500',
      icon: '✏️',
    },
  ];

  return (
    <div className="px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Chào mừng, {user?.username}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Chọn chế độ học để bắt đầu
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {features.map((feature) => (
          <Link
            key={feature.path}
            to={feature.path}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
          >
            <div className={`${feature.color} w-12 h-12 rounded-lg mb-4 flex items-center justify-center`}>
              <span className="text-white text-2xl">{feature.icon}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;

