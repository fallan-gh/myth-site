"use client";

import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  stagger?: number;
  delay?: number;
  /** 'chars' (default) | 'words' */
  splitBy?: 'chars' | 'words';
  style?: React.CSSProperties;
}

const CHAR_VARIANTS: Variants = {
  hidden: { y: '105%' },
  visible: (i: number) => ({
    y: '0%',
    transition: {
      delay: i,
      duration: 0.82,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const AnimatedText = React.memo(function AnimatedText({
  text,
  className = '',
  stagger = 0.022,
  delay = 0,
  splitBy = 'chars',
  style = {},
}: AnimatedTextProps) {
  const tokens = useMemo(
    () => (splitBy === 'words' ? text.split(' ') : text.split('')),
    [text, splitBy]
  );

  return (
    <span
      aria-label={text}
      className={className}
      style={{ display: 'inline-flex', flexWrap: 'wrap', gap: splitBy === 'words' ? '0.25em' : 0, ...style }}
    >
      {tokens.map((token, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            // Whitespace char needs explicit width
            ...(token === ' ' ? { width: '0.25em' } : {}),
          }}
        >
          <motion.span
            variants={CHAR_VARIANTS}
            initial="hidden"
            animate="visible"
            custom={delay + i * stagger}
            style={{
              display: 'inline-block',
              willChange: 'transform',
              transform: 'translateZ(0)',
            }}
          >
            {token === ' ' ? '\u00A0' : token}
          </motion.span>
        </span>
      ))}
    </span>
  );
});

export default AnimatedText;
