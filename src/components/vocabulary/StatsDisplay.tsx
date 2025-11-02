interface StatsDisplayProps {
  current: number;
  total: number;
  correct: number;
  incorrect: number;
  streak?: number;
}

const StatsDisplay = ({ current, total, correct, incorrect, streak }: StatsDisplayProps) => {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
      <div className="text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Từ {current} / {total}
        </div>
        <div className="flex justify-center gap-4 text-sm mb-2">
          <span className="text-success">Đúng: {correct}</span>
          <span className="text-error">Sai: {incorrect}</span>
          <span>Tỷ lệ: {accuracy}%</span>
        </div>
        {streak !== undefined && streak > 0 && (
          <div className="text-warning font-semibold">🔥 Streak: {streak}</div>
        )}
      </div>
    </div>
  );
};

export default StatsDisplay;

