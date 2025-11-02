import { useState, useEffect } from 'react';

interface Vocab {
  _id: string;
  zh: string;
  pinyin: string;
  vi: string;
  source_tag?: string;
}

interface MatchGameModeProps {
  vocabs: Vocab[];
  onAnswer: (answers: Record<string, string>, correct: boolean) => void;
}

const MatchGameMode = ({ vocabs, onAnswer }: MatchGameModeProps) => {
  const [chineseWords, setChineseWords] = useState<Vocab[]>([]);
  const [vietnameseWords, setVietnameseWords] = useState<string[]>([]);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedChinese, setSelectedChinese] = useState<string | null>(null);
  const [selectedVietnamese, setSelectedVietnamese] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [checked, setChecked] = useState(false);
  const [correctMatches, setCorrectMatches] = useState<Record<string, string>>({});

  useEffect(() => {
    // Take 6-8 random vocabs
    const selectedVocabs = vocabs.sort(() => 0.5 - Math.random()).slice(0, Math.min(8, vocabs.length));
    const shuffled = [...selectedVocabs].sort(() => 0.5 - Math.random());
    
    setChineseWords(shuffled);
    setVietnameseWords(
      shuffled.map((v) => v.vi).sort(() => 0.5 - Math.random())
    );
    
    // Create correct matches map
    const correct: Record<string, string> = {};
    shuffled.forEach((v) => {
      correct[v.zh] = v.vi;
    });
    setCorrectMatches(correct);
    
    setMatches({});
    setChecked(false);
    setIsCorrect(false);
  }, [vocabs]);

  const handleChineseClick = (zh: string) => {
    if (checked || matches[zh]) return;
    
    if (selectedChinese === zh) {
      setSelectedChinese(null);
    } else {
      setSelectedChinese(zh);
      if (selectedVietnamese) {
        // Try to match
        setMatches({ ...matches, [zh]: selectedVietnamese });
        setVietnameseWords(vietnameseWords.filter((v) => v !== selectedVietnamese));
        setSelectedChinese(null);
        setSelectedVietnamese(null);
        
        // Check if all matched
        const newMatches = { ...matches, [zh]: selectedVietnamese };
        if (Object.keys(newMatches).length === chineseWords.length) {
          checkAllMatches(newMatches);
        }
      } else {
        setSelectedChinese(zh);
      }
    }
  };

  const handleVietnameseClick = (vi: string) => {
    if (checked || Object.values(matches).includes(vi)) return;
    
    if (selectedVietnamese === vi) {
      setSelectedVietnamese(null);
    } else {
      setSelectedVietnamese(vi);
      if (selectedChinese) {
        // Try to match
        setMatches({ ...matches, [selectedChinese]: vi });
        setVietnameseWords(vietnameseWords.filter((v) => v !== vi));
        setSelectedChinese(null);
        setSelectedVietnamese(null);
        
        // Check if all matched
        const newMatches = { ...matches, [selectedChinese]: vi };
        if (Object.keys(newMatches).length === chineseWords.length) {
          checkAllMatches(newMatches);
        }
      } else {
        setSelectedVietnamese(vi);
      }
    }
  };

  const checkAllMatches = (allMatches: Record<string, string>) => {
    let allCorrect = true;
    Object.entries(allMatches).forEach(([zh, vi]) => {
      if (correctMatches[zh] !== vi) {
        allCorrect = false;
      }
    });
    
    setIsCorrect(allCorrect);
    setChecked(true);
    onAnswer(allMatches, allCorrect);
  };

  const handleCheck = () => {
    if (Object.keys(matches).length < chineseWords.length) {
      alert('Vui lòng ghép tất cả các từ');
      return;
    }
    checkAllMatches(matches);
  };

  const handleNext = () => {
    // Reset for next round
    const selectedVocabs = vocabs.sort(() => 0.5 - Math.random()).slice(0, Math.min(8, vocabs.length));
    const shuffled = [...selectedVocabs].sort(() => 0.5 - Math.random());
    
    setChineseWords(shuffled);
    setVietnameseWords(
      shuffled.map((v) => v.vi).sort(() => 0.5 - Math.random())
    );
    
    const correct: Record<string, string> = {};
    shuffled.forEach((v) => {
      correct[v.zh] = v.vi;
    });
    setCorrectMatches(correct);
    
    setMatches({});
    setChecked(false);
    setIsCorrect(false);
    setSelectedChinese(null);
    setSelectedVietnamese(null);
    onAnswer({}, false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">🧩 Match Game</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Kéo hoặc click để ghép từ tiếng Trung với nghĩa tiếng Việt
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Đã ghép: {Object.keys(matches).length} / {chineseWords.length}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(Object.keys(matches).length / chineseWords.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Chinese words */}
        <div>
          <h4 className="font-semibold mb-3 text-center">Tiếng Trung</h4>
          <div className="space-y-2">
            {chineseWords.map((vocab) => {
              const matched = matches[vocab.zh];
              const isSelected = selectedChinese === vocab.zh;
              const isMatched = !!matched;
              const isMatchedCorrect = isMatched && correctMatches[vocab.zh] === matched;

              let bgColor = 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
              if (checked && isMatched) {
                bgColor = isMatchedCorrect
                  ? 'bg-green-100 dark:bg-green-900/30 border-2 border-success'
                  : 'bg-red-100 dark:bg-red-900/30 border-2 border-error';
              } else if (isSelected) {
                bgColor = 'bg-blue-100 dark:bg-blue-900/30';
              } else if (isMatched) {
                bgColor = 'bg-blue-50 dark:bg-blue-900/20';
              }

              return (
                <button
                  key={vocab._id}
                  onClick={() => handleChineseClick(vocab.zh)}
                  disabled={isMatched || checked}
                  className={`w-full p-3 rounded-lg text-left transition chinese-text ${bgColor} disabled:opacity-60`}
                >
                  {vocab.zh}
                  {matched && !checked && (
                    <span className="text-xs text-gray-500 ml-2">→ {matched}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Vietnamese words */}
        <div>
          <h4 className="font-semibold mb-3 text-center">Tiếng Việt</h4>
          <div className="space-y-2">
            {vietnameseWords.map((vi, index) => {
              const isSelected = selectedVietnamese === vi;
              const isMatched = Object.values(matches).includes(vi);

              let bgColor = 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
              if (isSelected) {
                bgColor = 'bg-blue-100 dark:bg-blue-900/30';
              } else if (isMatched && !checked) {
                bgColor = 'bg-blue-50 dark:bg-blue-900/20';
              }

              return (
                <button
                  key={`${vi}-${index}`}
                  onClick={() => handleVietnameseClick(vi)}
                  disabled={isMatched || checked}
                  className={`w-full p-3 rounded-lg text-left transition ${bgColor} disabled:opacity-60`}
                >
                  {vi}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Match preview */}
      {Object.keys(matches).length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm font-semibold mb-2">Các cặp đã ghép:</div>
          <div className="space-y-1">
            {Object.entries(matches).map(([zh, vi]) => (
              <div key={zh} className="text-sm chinese-text">
                {zh} ↔ {vi}
              </div>
            ))}
          </div>
        </div>
      )}

      {checked && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
          }`}
        >
          <div className={`text-center text-2xl font-bold mb-2 ${isCorrect ? 'text-success' : 'text-error'}`}>
            {isCorrect ? '✓ Hoàn thành đúng!' : '✗ Có cặp sai'}
          </div>
          <div className="text-center text-sm">
            {isCorrect
              ? 'Tuyệt vời! Tất cả các cặp đều đúng'
              : 'Hãy xem lại các cặp sai và thử lại'}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={Object.keys(matches).length < chineseWords.length}
            className="flex-1 px-4 py-3 bg-success text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
          >
            Kiểm tra
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
          >
            Vòng tiếp theo
          </button>
        )}
      </div>
    </div>
  );
};

export default MatchGameMode;

