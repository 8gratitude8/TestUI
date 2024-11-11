import { useLocation, useNavigate } from 'react-router-dom';
import { useTeleprompter } from '@/hooks/useTeleprompter';
import { TeleprompterControls } from '@/components/TeleprompterControls';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2 } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";

interface TeleprompterState {
  script: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;
}

const Teleprompter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editableScript, setEditableScript] = useState('');
  const { script, fontSize, fontFamily, textColor } = (location.state as TeleprompterState) || {};
  const highlightRef = useRef<HTMLSpanElement>(null);
  
  const {
    isPlaying,
    speed,
    containerRef,
    togglePlay,
    updateSpeed,
    reset,
    updateScrollPosition
  } = useTeleprompter(2);

  useEffect(() => {
    if (!script) {
      navigate('/');
      return;
    }
    setWords(script.split(/\s+/).filter(word => word.length > 0));
    setEditableScript(script);
  }, [script, navigate]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentWordIndex(prev => {
          if (prev >= words.length - 1) {
            clearInterval(interval);
            togglePlay();
            return prev;
          }
          return prev + 1;
        });
      }, 60000 / (speed * 200));
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, speed, words.length, togglePlay]);

  useEffect(() => {
    if (highlightRef.current) {
      updateScrollPosition(highlightRef.current);
    }
  }, [currentWordIndex, updateScrollPosition]);

  const handleExit = useCallback(() => {
    reset();
    setCurrentWordIndex(0);
    navigate('/');
  }, [reset, navigate]);

  const handleWordClick = useCallback((index: number) => {
    setCurrentWordIndex(index);
  }, []);

  const handleEditToggle = useCallback(() => {
    if (isEditing) {
      // Save changes and update words
      setWords(editableScript.split(/\s+/).filter(word => word.length > 0));
      setCurrentWordIndex(0);
    }
    setIsEditing(!isEditing);
  }, [isEditing, editableScript]);

  return (
    <div className="min-h-screen bg-teleprompter-bg overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
      
      <div className="fixed top-6 left-6 z-50 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExit}
          className="rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleEditToggle}
          className="rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-105"
        >
          <Edit2 className="h-6 w-6" />
        </Button>
      </div>
      
      <div
        ref={containerRef}
        className="h-screen overflow-hidden relative z-10 smooth-scroll"
      >
        {isEditing ? (
          <Textarea
            value={editableScript}
            onChange={(e) => setEditableScript(e.target.value)}
            className="w-full h-full bg-transparent border-none resize-none p-8 focus:ring-0 teleprompter-text"
            style={{
              fontFamily: fontFamily === 'inter' ? 'Inter' : 
                         fontFamily === 'cal-sans' ? 'Cal Sans' : fontFamily,
              fontSize: `${fontSize / 16}rem`,
              color: textColor,
            }}
          />
        ) : (
          <div 
            className="teleprompter-text"
            style={{
              fontFamily: fontFamily === 'inter' ? 'Inter' : 
                         fontFamily === 'cal-sans' ? 'Cal Sans' : fontFamily,
              fontSize: `${fontSize / 16}rem`,
              color: textColor,
            }}
          >
            {words.map((word, index) => (
              <span
                key={index}
                ref={index === currentWordIndex ? highlightRef : null}
                onClick={() => handleWordClick(index)}
                className={`inline-block mx-1 px-1 py-0.5 rounded transition-all duration-300 cursor-pointer hover:bg-teleprompter-highlight/20 ${
                  index === currentWordIndex
                    ? 'text-teleprompter-highlight scale-110 bg-teleprompter-highlight/10 font-semibold'
                    : index < currentWordIndex
                    ? 'text-white/60'
                    : 'text-white/40'
                }`}
                style={{
                  color: index === currentWordIndex ? '#3B82F6' : undefined,
                  opacity: index === currentWordIndex ? 1 : undefined
                }}
              >
                {word}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="fixed inset-x-0 top-0 h-40 bg-gradient-to-b from-teleprompter-bg via-teleprompter-bg/80 to-transparent pointer-events-none z-20" />
      <div className="fixed inset-x-0 bottom-0 h-40 bg-gradient-to-t from-teleprompter-bg via-teleprompter-bg/80 to-transparent pointer-events-none z-20" />
      
      <TeleprompterControls
        isPlaying={isPlaying}
        speed={speed}
        onTogglePlay={togglePlay}
        onSpeedChange={updateSpeed}
        onExit={handleExit}
      />
    </div>
  );
};

export default Teleprompter;