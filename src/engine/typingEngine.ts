export class TypingEngine {
  chars: string[];
  index: number;
  correctChars: number;
  totalChars: number;
  errors: number;
  startTime: number | null;
  mistypedChars: Record<string, number>;
  charStates: ('correct' | 'incorrect' | null)[];

  constructor(chars: string[]) {
    this.chars = chars;
    this.index = 0;
    this.correctChars = 0;
    this.totalChars = 0;
    this.errors = 0;
    this.startTime = null;
    this.mistypedChars = {};
    this.charStates = new Array(chars.length).fill(null);
  }

  start() {
    this.startTime = Date.now();
  }

  moveToNextWord() {
    let nextSpaceIndex = this.chars.indexOf(' ', this.index);
    if (nextSpaceIndex === -1) {
      nextSpaceIndex = this.chars.length;
    }
    
    for (let i = this.index; i < nextSpaceIndex; i++) {
      if (this.charStates[i] === null) {
        this.errors++;
        this.charStates[i] = 'incorrect';
      }
    }
    
    this.index = nextSpaceIndex + 1;
    if (this.index > this.chars.length) {
      this.index = this.chars.length;
    }
    return 'next_word';
  }

  handleInput(key: string, expectedChar: string) {
    if (key === 'Backspace') {
      if (this.index > 0) {
        this.index--;
        const prevState = this.charStates[this.index];
        if (prevState === 'correct') {
          this.correctChars--;
        }
        this.charStates[this.index] = null;
        return 'backspace';
      }
      return 'ignore';
    }

    if (key.length > 1) return 'ignore';
    if (this.index >= this.chars.length) return 'ignore';

    if (key === ' ') {
      if (expectedChar === ' ') {
        this.totalChars++;
        this.correctChars++;
        this.charStates[this.index] = 'correct';
        this.index++;
        return 'correct';
      } else {
        if (this.index === 0 || this.chars[this.index - 1] === ' ') {
          return 'ignore';
        }
        this.totalChars++;
        return this.moveToNextWord();
      }
    }

    this.totalChars++;

    if (key === expectedChar) {
      this.correctChars++;
      this.charStates[this.index] = 'correct';
      this.index++;
      return "correct";
    } else {
      this.errors++;
      const charToRecord = expectedChar === ' ' ? 'space' : expectedChar;
      this.mistypedChars[charToRecord] = (this.mistypedChars[charToRecord] || 0) + 1;
      this.charStates[this.index] = 'incorrect';
      this.index++;
      return "incorrect";
    }
  }
}
