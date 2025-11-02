interface HintHelperProps {
  sentence: {
    zh: string;
    vi: string;
    pinyin?: string;
  };
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

const HintHelper = ({ sentence, correctAnswer, isCorrect }: HintHelperProps) => {
  if (isCorrect) return null;

  // Generate hint: show first 1-2 characters or pinyin
  const getHint = () => {
    if (!correctAnswer) return '';
    
    // If answer is Chinese, show first 1-2 characters
    if (/[\u4e00-\u9fff]/.test(correctAnswer)) {
      return correctAnswer.substring(0, Math.min(2, correctAnswer.length));
    }
    
    // If answer is Vietnamese or other, show first character
    return correctAnswer.substring(0, 1);
  };

  const hint = getHint();
  const pinyinHint = sentence.pinyin?.split(' ')[0] || '';

  return (
    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
      <div className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
        💡 Gợi ý:
      </div>
      {hint && (
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
          Ký tự đầu: <span className="font-semibold chinese-text">{hint}</span>
        </div>
      )}
      {pinyinHint && (
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Pinyin đầu: <span className="font-semibold">{pinyinHint}</span>
        </div>
      )}
    </div>
  );
};

export default HintHelper;

