import React from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Trash2, CheckCircle } from 'lucide-react';

interface SwipeableItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeLeftColor?: string;
  swipeRightColor?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const SwipeableItem: React.FC<SwipeableItemProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  swipeLeftColor = 'bg-red-600',
  swipeRightColor = 'bg-green-600',
  leftIcon,
  rightIcon,
  className = ''
}) => {
  const x = useMotionValue(0);
  
  // Icon Opacity & Scale Logic
  const iconOpacityRight = useTransform(x, [10, 60], [0, 1]);
  const iconOpacityLeft = useTransform(x, [-10, -60], [0, 1]);
  const scaleIcon = useTransform(x, [-100, -50, 0, 50, 100], [1.2, 0.9, 0.5, 0.9, 1.2]);

  // Background Visibility Logic
  // Ensures that the 'Left Swipe' background doesn't cover the 'Right Swipe' background
  // when both are present in the DOM.
  const bgOpacityRight = useTransform(x, [0, 5], [0, 1]); // Show Right-Swipe BG only when moving Right
  const bgOpacityLeft = useTransform(x, [-5, 0], [1, 0]); // Show Left-Swipe BG only when moving Left

  // Default icons
  const iconRight = rightIcon || <CheckCircle className="text-white w-8 h-8" />;
  const iconLeft = leftIcon || <Trash2 className="text-white w-8 h-8" />;

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 80;
    
    if (onSwipeRight && info.offset.x > threshold) {
      onSwipeRight();
    } else if (onSwipeLeft && info.offset.x < -threshold) {
      onSwipeLeft();
    }
  };

  return (
    <div className={`relative mb-3 ${className}`}>
      {/* Background Layer - Right Action (Shown when dragging Right) */}
      {onSwipeRight && (
        <motion.div 
          style={{ opacity: bgOpacityRight }}
          className={`absolute inset-0 ${swipeRightColor} rounded-3xl flex items-center justify-start pl-6 overflow-hidden z-0`}
        >
          <motion.div style={{ opacity: iconOpacityRight, scale: scaleIcon }}>
            {iconRight}
          </motion.div>
        </motion.div>
      )}

      {/* Background Layer - Left Action (Shown when dragging Left) */}
      {onSwipeLeft && (
        <motion.div 
          style={{ opacity: bgOpacityLeft }}
          className={`absolute inset-0 ${swipeLeftColor} rounded-3xl flex items-center justify-end pr-6 overflow-hidden z-0`}
        >
          <motion.div style={{ opacity: iconOpacityLeft, scale: scaleIcon }}>
            {iconLeft}
          </motion.div>
        </motion.div>
      )}

      {/* Foreground Layer - Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={handleDragEnd}
        style={{ x, touchAction: 'pan-y' }}
        className="relative bg-neutral-900 rounded-3xl z-10"
        whileTap={{ cursor: 'grabbing' }}
      >
        {children}
      </motion.div>
    </div>
  );
};