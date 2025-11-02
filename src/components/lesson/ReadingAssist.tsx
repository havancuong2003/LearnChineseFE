import { useState } from 'react';

interface Word {
  zh: string;
  pinyin?: string;
  vi?: string;
}

interface ReadingAssistProps {
  sentence: {
    zh: string;
    vi: string;
  };
  words?: Word[];
}

const ReadingAssist = ({ sentence, words }: ReadingAssistProps) => {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  // Parse sentence into words (simplified - split by spaces and punctuation)
  const parseWords = (text: string): Array<{ word: string; index: number }> => {
    const words: Array<{ word: string; index: number }> = [];
    let currentWord = '';
    let index = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (/[\u4e00-\u9fff]/.test(char)) {
        // Chinese character
        if (currentWord) {
          words.push({ word: currentWord, index });
          index++;
          currentWord = '';
        }
        words.push({ word: char, index });
        index++;
      } else if (char.trim()) {
        currentWord += char;
      } else {
        if (currentWord) {
          words.push({ word: currentWord, index });
          index++;
          currentWord = '';
        }
      }
    }
    if (currentWord) {
      words.push({ word: currentWord, index });
    }

    return words;
  };

  const parsedWords = parseWords(sentence.zh);

  const handleWordHover = (word: string, event: React.MouseEvent) => {
    setHoveredWord(word);
    setHoverPosition({ x: event.clientX, y: event.clientY });
  };

  const handleWordLeave = () => {
    setHoveredWord(null);
    setHoverPosition(null);
  };

  const findWordInfo = (word: string) => {
    // Try to find word in words array
    if (words) {
      const found = words.find(w => w.zh === word);
      if (found) return found;
    }
    // Fallback: return basic info
    return { zh: word, vi: '', pinyin: '' };
  };

  return (
    <div className="relative">
      <div 
        className="text-2xl chinese-text leading-relaxed cursor-help"
        onMouseLeave={handleWordLeave}
      >
        {parsedWords.map((item, idx) => (
          <span
            key={idx}
            onMouseEnter={(e) => handleWordHover(item.word, e)}
            className="hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition px-1 rounded"
          >
            {item.word}
          </span>
        ))}
      </div>

      {hoveredWord && hoverPosition && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 pointer-events-none"
          style={{
            left: `${hoverPosition.x + 10}px`,
            top: `${hoverPosition.y + 10}px`,
          }}
        >
          {(() => {
            const wordInfo = findWordInfo(hoveredWord);
            return (
              <>
                <div className="font-semibold chinese-text text-lg mb-1">{wordInfo.zh}</div>
                {wordInfo.pinyin && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{wordInfo.pinyin}</div>
                )}
                {wordInfo.vi && (
                  <div className="text-sm text-gray-700 dark:text-gray-300">{wordInfo.vi}</div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ReadingAssist;

