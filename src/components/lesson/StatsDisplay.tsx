interface StatsDisplayProps {
  stats: {
    total: number;
    correct: number;
    incorrect: number;
    averageTime?: number;
  };
  startTime?: number;
}

const StatsDisplay = ({ stats, startTime }: StatsDisplayProps) => {
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  const currentTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const averageTime = stats.total > 0 ? Math.round(currentTime / stats.total) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">📊 Thống kê học tập</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded">
          <div className="text-2xl font-bold text-success">{stats.correct}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Đúng</div>
        </div>
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded">
          <div className="text-2xl font-bold text-error">{stats.incorrect}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Sai</div>
        </div>
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{accuracy}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Tỷ lệ đúng</div>
        </div>
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatTime(averageTime)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">TB/câu</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Tổng câu: <span className="font-semibold">{stats.total}</span>
        </div>
        {startTime && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Thời gian: <span className="font-semibold">{formatTime(currentTime)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsDisplay;

