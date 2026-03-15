import { create } from 'zustand';
import { generateWords, generatePracticeWords, Language } from '../utils/words';

export type TestMode = 'time' | 'words';
export type FontType = 'font-mono' | 'font-sans' | 'font-serif';

interface TypingState {
  mode: TestMode;
  duration: number;
  wordCount: number;
  language: Language;
  font: FontType;
  words: string[];
  typedWords: string[];
  currentWordIndex: number;
  currentInput: string;
  errors: number;
  totalKeystrokes: number;
  startTime: number | null;
  endTime: number | null;
  isFinished: boolean;
  timeLeft: number;
  wpmHistory: { second: number; wpm: number; rawWpm: number; accuracy: number }[];
  mistypedChars: Record<string, number>;
  liveWpm: number;
  liveRawWpm: number;
  liveAccuracy: number;
  isPracticeMode: boolean;
  weakChars: string[];
  
  setMode: (mode: TestMode) => void;
  setDuration: (duration: number) => void;
  setWordCount: (count: number) => void;
  setLanguage: (language: Language) => void;
  setFont: (font: FontType) => void;
  startPracticeMode: (weakChars: string[]) => void;
  startTest: () => void;
  endTest: () => void;
  resetTest: () => void;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  mode: 'time',
  duration: 30,
  wordCount: 25,
  language: 'english',
  font: 'font-mono',
  words: generateWords(100, 'english'),
  typedWords: [],
  currentWordIndex: 0,
  currentInput: '',
  errors: 0,
  totalKeystrokes: 0,
  startTime: null,
  endTime: null,
  isFinished: false,
  timeLeft: 30,
  wpmHistory: [],
  mistypedChars: {},
  liveWpm: 0,
  liveRawWpm: 0,
  liveAccuracy: 100,
  isPracticeMode: false,
  weakChars: [],

  setMode: (mode) => {
    set({ mode, isPracticeMode: false, weakChars: [] });
    get().resetTest();
  },
  setDuration: (duration) => {
    set({ duration, timeLeft: duration, isPracticeMode: false, weakChars: [] });
    get().resetTest();
  },
  setWordCount: (wordCount) => {
    set({ wordCount, words: generateWords(wordCount, get().language), isPracticeMode: false, weakChars: [] });
    get().resetTest();
  },
  setLanguage: (language) => {
    set({ language, isPracticeMode: false, weakChars: [] });
    get().resetTest();
  },
  setFont: (font) => {
    set({ font });
  },

  startPracticeMode: (weakChars) => {
    set({ isPracticeMode: true, weakChars });
    get().resetTest();
  },

  startTest: () => set({ startTime: Date.now(), isFinished: false, wpmHistory: [] }),
  endTest: () => set({ endTime: Date.now(), isFinished: true }),
  
  resetTest: () => {
    const { mode, duration, wordCount, language, isPracticeMode, weakChars } = get();
    const count = mode === 'time' ? 400 : wordCount;
    const newWords = isPracticeMode && weakChars.length > 0 
      ? generatePracticeWords(count, weakChars, language)
      : generateWords(count, language);

    set({
      words: newWords,
      typedWords: [],
      currentWordIndex: 0,
      currentInput: '',
      errors: 0,
      totalKeystrokes: 0,
      startTime: null,
      endTime: null,
      isFinished: false,
      timeLeft: duration,
      wpmHistory: [],
      mistypedChars: {},
      liveWpm: 0,
      liveRawWpm: 0,
      liveAccuracy: 100
    });
  }
}));
