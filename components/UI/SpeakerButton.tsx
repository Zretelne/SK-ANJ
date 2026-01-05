import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { TTSService } from '../../services/TTSService';

interface SpeakerButtonProps {
  text: string;
  className?: string;
  size?: number;
  color?: string;
}

export const SpeakerButton: React.FC<SpeakerButtonProps> = ({ 
  text, 
  className = '', 
  size = 18,
  color = 'currentColor'
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Cleanup on unmount to stop speech if user navigates away
  useEffect(() => {
    return () => {
      if (isPlaying) {
        TTSService.stop();
      }
    };
  }, [isPlaying]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent click events
    
    if (isPlaying) {
      TTSService.stop();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    
    TTSService.speak(text, 'en-US', () => {
      // This callback runs exactly when speech finishes
      setIsPlaying(false);
    });
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      className={`p-2 rounded-full hover:bg-neutral-800 transition-colors active:scale-95 ${className}`}
      title="Prehrať výslovnosť"
    >
      <Volume2 
        size={size} 
        color={color}
        className={isPlaying ? 'animate-pulse text-red-500' : ''} 
        strokeWidth={2}
      />
    </button>
  );
};