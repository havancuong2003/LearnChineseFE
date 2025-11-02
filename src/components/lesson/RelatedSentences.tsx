interface Sentence {
  _id: string;
  zh: string;
  vi: string;
  lessonTitle?: string;
}

interface RelatedSentencesProps {
  currentSentence: Sentence;
  allSentences: Sentence[];
  onSelectSentence: (sentenceId: string) => void;
}

const RelatedSentences = ({ currentSentence, allSentences, onSelectSentence }: RelatedSentencesProps) => {
  // Find related sentences (same words or similar structure)
  const findRelated = () => {
    const currentWords = currentSentence.zh.split('');
    const related = allSentences
      .filter(s => s._id !== currentSentence._id)
      .map(s => {
        const sWords = s.zh.split('');
        const commonWords = currentWords.filter(w => sWords.includes(w));
        const similarity = commonWords.length / Math.max(currentWords.length, sWords.length);
        return { sentence: s, similarity };
      })
      .filter(item => item.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    return related.map(item => item.sentence);
  };

  const related = findRelated();

  if (related.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
        🔗 Câu tương tự trong bài khác:
      </div>
      <div className="space-y-2">
        {related.map((sentence) => (
          <button
            key={sentence._id}
            onClick={() => onSelectSentence(sentence._id)}
            className="block w-full text-left p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <div className="chinese-text text-sm font-semibold mb-1">{sentence.zh}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{sentence.vi}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RelatedSentences;

