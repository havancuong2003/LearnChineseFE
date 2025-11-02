interface Vocab {
  _id: string;
  zh: string;
  pinyin: string;
  vi: string;
}

interface Sentence {
  _id: string;
  zh: string;
  vi: string;
  options?: string[];
}

interface ReadingQuestion {
  _id: string;
  question: string;
  options?: string[];
  answer: { text: string } | string;
}

interface TestQuestion {
  id: string;
  type: 'vocab' | 'sentence' | 'reading';
  question: string;
  pinyin?: string;
  options?: string[];
  correctAnswer: string;
  sourceData?: any;
}

export const generateTest = (
  vocabs: Vocab[],
  sentences: Sentence[],
  readingQuestions: ReadingQuestion[],
  count: number,
  vocabRatio: number = 0.4,
  lessonRatio: number = 0.3,
  readingRatio: number = 0.3
): TestQuestion[] => {
  const totalVocab = Math.round(count * vocabRatio);
  const totalLesson = Math.round(count * lessonRatio);
  const totalReading = Math.round(count * readingRatio);

  // Shuffle and select random items
  const shuffledVocabs = [...vocabs].sort(() => 0.5 - Math.random()).slice(0, Math.min(totalVocab, vocabs.length));
  const shuffledSentences = [...sentences].sort(() => 0.5 - Math.random()).slice(0, Math.min(totalLesson, sentences.length));
  const shuffledReading = [...readingQuestions].sort(() => 0.5 - Math.random()).slice(0, Math.min(totalReading, readingQuestions.length));

  const questions: TestQuestion[] = [];

  // Add vocab questions
  shuffledVocabs.forEach((vocab) => {
    questions.push({
      id: vocab._id,
      type: 'vocab',
      question: vocab.vi,
      correctAnswer: vocab.zh,
      pinyin: vocab.pinyin,
      sourceData: vocab,
    });
  });

  // Add sentence questions
  shuffledSentences.forEach((sentence) => {
    if (sentence.options && sentence.options.length > 0) {
      // Multiple choice
      questions.push({
        id: sentence._id,
        type: 'sentence',
        question: sentence.zh,
        correctAnswer: sentence.options[0] || sentence.vi, // Assume first option is correct
        options: sentence.options,
        sourceData: sentence,
      });
    } else {
      // Translation
      questions.push({
        id: sentence._id,
        type: 'sentence',
        question: sentence.zh,
        correctAnswer: sentence.vi,
        sourceData: sentence,
      });
    }
  });

  // Add reading questions
  shuffledReading.forEach((rq) => {
    const correctAnswer = typeof rq.answer === 'object' ? rq.answer.text : rq.answer;
    questions.push({
      id: rq._id,
      type: 'reading',
      question: rq.question,
      correctAnswer: correctAnswer || '',
      options: rq.options,
      sourceData: rq,
    });
  });

  // Shuffle all questions and take count
  return questions.sort(() => 0.5 - Math.random()).slice(0, count);
};

export const gradeTest = (
  questions: TestQuestion[],
  answers: Record<string, string>
): {
  score: number;
  total: number;
  correct: number;
  incorrect: number;
  breakdown: {
    vocab: { total: number; correct: number };
    sentence: { total: number; correct: number };
    reading: { total: number; correct: number };
  };
  results: Array<{
    questionId: string;
    questionType: string;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    correct: boolean;
  }>;
} => {
  let correctCount = 0;
  const breakdown = {
    vocab: { total: 0, correct: 0 },
    sentence: { total: 0, correct: 0 },
    reading: { total: 0, correct: 0 },
  };

  const results = questions.map((question) => {
    const userAnswer = answers[question.id] || '';
    const correctAnswer = question.correctAnswer || '';
    
    let isCorrect = false;
    
    if (question.type === 'vocab') {
      // Exact match for Chinese
      isCorrect = userAnswer.trim() === correctAnswer.trim();
      breakdown.vocab.total++;
      if (isCorrect) breakdown.vocab.correct++;
    } else if (question.type === 'sentence') {
      // Case-insensitive match for translation
      isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
      breakdown.sentence.total++;
      if (isCorrect) breakdown.sentence.correct++;
    } else if (question.type === 'reading') {
      // For MCQ, exact match; for others, case-insensitive
      if (question.options && question.options.length > 0) {
        isCorrect = userAnswer.trim() === correctAnswer.trim();
      } else {
        isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
      }
      breakdown.reading.total++;
      if (isCorrect) breakdown.reading.correct++;
    }

    if (isCorrect) correctCount++;

    return {
      questionId: question.id,
      questionType: question.type,
      question: question.question,
      userAnswer,
      correctAnswer,
      correct: isCorrect,
    };
  });

  const total = questions.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return {
    score,
    total,
    correct: correctCount,
    incorrect: total - correctCount,
    breakdown,
    results,
  };
};

