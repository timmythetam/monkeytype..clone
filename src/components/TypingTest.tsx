import React, { useEffect, useRef, useState } from 'react';
import { useTypingStore, FontType } from '../store/useTypingStore';
import { Language } from '../utils/words';
import { clsx } from 'clsx';
import { RefreshCcw, Globe, Type, Target } from 'lucide-react';
import Results from './Results';
import { TypingEngine } from '../engine/typingEngine';
import { calculateWPM, calculateRawWPM, calculateAccuracy } from '../engine/metrics';

const TypingTest: React.FC = () => {
  const store = useTypingStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const wpmRef = useRef<HTMLSpanElement>(null);
  const accRef = useRef<HTMLSpanElement>(null);
  const typingAreaRef = useRef<HTMLDivElement>(null);
  
  const engineRef = useRef<TypingEngine | null>(null);
  const charElementsRef = useRef<HTMLElement[]>([]);
  const charPositionsRef = useRef<{ left: number; top: number; width: number }[]>([]);
  const charDomIndicesRef = useRef<number[]>([]);
  const activeLineTopRef = useRef<number>(0);
  const rafRef = useRef<number>();
  const historyRef = useRef<{ second: number; wpm: number; rawWpm: number; accuracy: number }[]>([]);
  const lastSecondRef = useRef<number>(0);

  // Initialize engine and DOM
  useEffect(() => {
    if (store.isFinished) return;

    const chars = store.words.join(' ').split('');
    engineRef.current = new TypingEngine(chars);
    historyRef.current = [];
    lastSecondRef.current = 0;
    
    if (containerRef.current) {
      charElementsRef.current = Array.from(containerRef.current.querySelectorAll('.char'));
      containerRef.current.style.transform = `translateY(0px)`;
    }
    
    const calculatePositions = () => {
      const positions: { left: number; top: number; width: number }[] = [];
      const domIndices: number[] = [];
      let charDomIndex = 0;
      
      engineRef.current?.chars.forEach((char, i) => {
        if (char === ' ') {
          domIndices.push(-1);
          const prevPos = positions[i - 1];
          if (prevPos) {
            positions.push({
              left: prevPos.left + prevPos.width,
              top: prevPos.top,
              width: 14 // approx width of a space
            });
          } else {
            positions.push({ left: 0, top: 0, width: 0 });
          }
        } else {
          domIndices.push(charDomIndex);
          const el = charElementsRef.current[charDomIndex];
          if (el) {
            positions.push({
              left: el.offsetLeft,
              top: el.offsetTop,
              width: el.offsetWidth
            });
          } else {
            positions.push({ left: 0, top: 0, width: 0 });
          }
          charDomIndex++;
        }
      });
      
      charPositionsRef.current = positions;
      charDomIndicesRef.current = domIndices;
      activeLineTopRef.current = 0;
      
      if (caretRef.current && charPositionsRef.current[engineRef.current?.index || 0]) {
        const pos = charPositionsRef.current[engineRef.current?.index || 0];
        caretRef.current.style.transform = `translate(${pos.left}px, ${pos.top}px)`;
      }
    };

    // Calculate positions immediately, and again after a brief delay to ensure DOM is fully rendered and fonts are loaded
    calculatePositions();
    const timeoutId = setTimeout(calculatePositions, 50);
    window.addEventListener('resize', calculatePositions);
    
    charElementsRef.current.forEach(el => {
      el.className = 'char text-zinc-500';
    });

    if (timeRef.current) {
      timeRef.current.textContent = store.mode === 'time' ? store.duration.toString() : `0/${store.wordCount}`;
    }
    if (wpmRef.current) wpmRef.current.textContent = '0 wpm';
    if (accRef.current) accRef.current.textContent = '100%';

    typingAreaRef.current?.focus();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculatePositions);
    };
  }, [store.words, store.mode, store.duration, store.wordCount, store.isFinished, store.font]);

  // Stats Loop
  useEffect(() => {
    if (store.isFinished) return;

    const statsLoop = () => {
      if (!engineRef.current || !engineRef.current.startTime) {
        rafRef.current = requestAnimationFrame(statsLoop);
        return;
      }
      
      const elapsedMs = Date.now() - engineRef.current.startTime;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      
      if (store.mode === 'time') {
        const timeLeft = Math.max(0, store.duration - elapsedSec);
        if (timeRef.current) timeRef.current.textContent = timeLeft.toString();
        
        if (timeLeft === 0) {
          finishTest();
          return;
        }
      } else {
        const currentWordIdx = engineRef.current.chars.slice(0, engineRef.current.index).filter(c => c === ' ').length;
        if (timeRef.current) timeRef.current.textContent = `${currentWordIdx}/${store.wordCount}`;
        
        if (engineRef.current.index >= engineRef.current.chars.length) {
          finishTest();
          return;
        }
      }
      
      const wpm = calculateWPM(engineRef.current.correctChars, elapsedMs);
      const rawWpm = calculateRawWPM(engineRef.current.totalChars, elapsedMs);
      const acc = calculateAccuracy(engineRef.current.errors, engineRef.current.totalChars);
      
      if (wpmRef.current) wpmRef.current.textContent = `${wpm} wpm`;
      if (accRef.current) accRef.current.textContent = `${acc}%`;
      
      if (elapsedSec > lastSecondRef.current) {
        lastSecondRef.current = elapsedSec;
        historyRef.current.push({ second: elapsedSec, wpm, rawWpm, accuracy: acc });
      }
      
      rafRef.current = requestAnimationFrame(statsLoop);
    };
    
    rafRef.current = requestAnimationFrame(statsLoop);
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [store.isFinished, store.mode, store.duration, store.wordCount]);

  const finishTest = () => {
    if (!engineRef.current || !engineRef.current.startTime) return;
    
    const elapsedMs = Date.now() - engineRef.current.startTime;
    const wpm = calculateWPM(engineRef.current.correctChars, elapsedMs);
    const rawWpm = calculateRawWPM(engineRef.current.totalChars, elapsedMs);
    const acc = calculateAccuracy(engineRef.current.errors, engineRef.current.totalChars);

    useTypingStore.setState({
      isFinished: true,
      endTime: Date.now(),
      errors: engineRef.current.errors,
      totalKeystrokes: engineRef.current.totalChars,
      mistypedChars: engineRef.current.mistypedChars,
      wpmHistory: historyRef.current,
      liveWpm: wpm,
      liveRawWpm: rawWpm,
      liveAccuracy: acc
    });
  };

  // Keyboard Listener
  useEffect(() => {
    if (store.isFinished) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === ' ' || e.code === 'Space' || e.key.length === 1 || e.key === 'Backspace') e.preventDefault();
      
      const engine = engineRef.current;
      if (!engine) return;
      
      if (!engine.startTime && e.key.length === 1) {
        engine.start();
        useTypingStore.setState({ startTime: Date.now() });
      }
      
      const chars = charElementsRef.current;
      const currentIndex = engine.index;
      
      const caret = caretRef.current;
      if (caret) {
        caret.classList.remove('animate-pulse');
        clearTimeout((caret as any).blinkTimeout);
        (caret as any).blinkTimeout = setTimeout(() => {
          caret.classList.add('animate-pulse');
        }, 500);
      }

      if (e.key === 'Backspace') {
        const result = engine.handleInput(e.key, '');
        if (result === 'backspace') {
          const newIndex = engine.index;
          const domIdx = charDomIndicesRef.current[newIndex];
          if (domIdx !== -1 && charElementsRef.current[domIdx]) {
            charElementsRef.current[domIdx].className = 'char text-zinc-500';
          }
          updateCaret(newIndex);
        }
        return;
      }
      
      if (e.key.length > 1) return;
      
      const expectedChar = engine.chars[currentIndex];
      const result = engine.handleInput(e.key, expectedChar);
      
      if (result === 'ignore') return;
      
      if (result === 'next_word') {
        for (let i = currentIndex; i < engine.index; i++) {
          const domIdx = charDomIndicesRef.current[i];
          if (domIdx !== -1 && charElementsRef.current[domIdx]) {
            charElementsRef.current[domIdx].className = 'char text-red-500';
          }
        }
        updateCaret(engine.index);
        
        if (engine.index >= engine.chars.length) {
          finishTest();
        }
        return;
      }
      
      const domIndex = charDomIndicesRef.current[currentIndex];
      
      if (result === 'correct') {
        if (domIndex !== -1 && charElementsRef.current[domIndex]) {
          charElementsRef.current[domIndex].className = 'char text-green-500';
        }
      } else if (result === 'incorrect') {
        if (domIndex !== -1 && charElementsRef.current[domIndex]) {
          charElementsRef.current[domIndex].className = 'char text-red-500';
        }
      }
      
      updateCaret(engine.index);

      if (engine.index >= engine.chars.length) {
        finishTest();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store.isFinished]);

  const updateCaret = (index: number) => {
    const positions = charPositionsRef.current;
    const caret = caretRef.current;
    if (!caret) return;
    
    if (index < positions.length) {
      const pos = positions[index];
      if (!pos) return;
      
      caret.style.transform = `translate(${pos.left}px, ${pos.top}px)`;
      
      const container = containerRef.current;
      if (container) {
        if (pos.top !== activeLineTopRef.current) {
          if (pos.top > 80) {
            container.style.transform = `translateY(-${pos.top - 45}px)`;
          } else {
            container.style.transform = `translateY(0px)`;
          }
          activeLineTopRef.current = pos.top;
        }
      }
    } else {
      const lastPos = positions[positions.length - 1];
      if (lastPos) {
        caret.style.transform = `translate(${lastPos.left + lastPos.width}px, ${lastPos.top}px)`;
      }
    }
  };

  if (store.isFinished) {
    return <Results />;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto min-h-[80vh] px-4">
      
      {/* Settings Bar */}
      <div className="flex justify-between w-full mb-8 text-zinc-500 font-mono text-sm">
        <div className="flex gap-4 items-center bg-zinc-900/50 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2 border-r border-zinc-700/50 pr-4">
            <Globe size={16} />
            <select 
              value={store.language}
              onChange={(e) => store.setLanguage(e.target.value as Language)}
              className="bg-transparent focus:outline-none cursor-pointer hover:text-zinc-300 transition-colors"
            >
              <option value="english">english</option>
              <option value="spanish">spanish</option>
              <option value="french">french</option>
              <option value="german">german</option>
            </select>
          </div>
          <div className="flex items-center gap-2 border-r border-zinc-700/50 pr-4">
            <Type size={16} />
            <select 
              value={store.font}
              onChange={(e) => store.setFont(e.target.value as FontType)}
              className="bg-transparent focus:outline-none cursor-pointer hover:text-zinc-300 transition-colors"
            >
              <option value="font-mono">mono</option>
              <option value="font-sans">sans</option>
              <option value="font-serif">serif</option>
            </select>
          </div>
          {store.isPracticeMode && (
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Target size={16} />
              <span>practice mode</span>
            </div>
          )}
        </div>

        <div className="flex gap-6 bg-zinc-900/50 px-4 py-2 rounded-lg">
          <div className="flex gap-3 border-r border-zinc-700/50 pr-6">
            <button 
              onClick={() => store.setMode('time')} 
              className={clsx("transition-colors", store.mode === 'time' ? 'text-emerald-400' : 'hover:text-zinc-300')}
            >
              time
            </button>
            <button 
              onClick={() => store.setMode('words')} 
              className={clsx("transition-colors", store.mode === 'words' ? 'text-emerald-400' : 'hover:text-zinc-300')}
            >
              words
            </button>
          </div>
          
          <div className="flex gap-3">
            {store.mode === 'time' ? (
              <>
                {[15, 30, 60, 120].map(t => (
                  <button 
                    key={t}
                    onClick={() => store.setDuration(t)} 
                    className={clsx("transition-colors", store.duration === t ? 'text-emerald-400' : 'hover:text-zinc-300')}
                  >
                    {t}
                  </button>
                ))}
              </>
            ) : (
              <>
                {[10, 25, 50, 100].map(w => (
                  <button 
                    key={w}
                    onClick={() => store.setWordCount(w)} 
                    className={clsx("transition-colors", store.wordCount === w ? 'text-emerald-400' : 'hover:text-zinc-300')}
                  >
                    {w}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between w-full mb-4 text-emerald-400 font-bold text-xl">
        <span ref={timeRef}>
          {store.mode === 'time' ? store.duration : `0/${store.wordCount}`}
        </span>
        <div className={clsx("flex gap-4 text-zinc-500 font-mono transition-opacity duration-300", store.startTime ? "opacity-100" : "opacity-0")}>
          <span ref={wpmRef}>0 wpm</span>
          <span ref={accRef}>100%</span>
        </div>
      </div>

      <div 
        ref={typingAreaRef}
        className={clsx(
          "relative w-full max-w-[900px] mx-auto overflow-hidden select-none focus:outline-none",
          store.font
        )}
        style={{ minHeight: '135px', maxHeight: '140px', fontSize: '28px', lineHeight: '1.6' }}
        tabIndex={0}
      >
        <div 
          ref={containerRef}
          className="relative flex flex-wrap content-start transition-transform duration-150 ease-out"
          style={{ gap: '6px' }}
        >
          <div 
            ref={caretRef}
            className="absolute w-[2px] h-[1.1em] bg-green-500 animate-pulse"
            style={{ 
              transition: 'transform 0.08s cubic-bezier(0.2, 0, 0, 1)',
              top: '0.2em',
              left: 0,
              transform: 'translate(-100px, -100px)'
            }}
          />
          {store.words.map((word, wordIdx) => (
            <div key={wordIdx} className="word" style={{ marginRight: '0.6ch', whiteSpace: 'nowrap', display: 'inline-block' }}>
              {word.split('').map((char, charIdx) => (
                <span key={charIdx} className="char text-zinc-500">{char}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 flex justify-center">
        <button 
          onClick={store.resetTest}
          className="p-4 text-zinc-500 hover:text-zinc-200 transition-colors rounded-full hover:bg-zinc-800"
        >
          <RefreshCcw size={24} />
        </button>
      </div>
    </div>
  );
};

export default TypingTest;
