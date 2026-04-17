"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  stagger?: number;
  delay?: number;
  once?: boolean;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ 
  text, 
  className = "", 
  stagger = 0.02, 
  delay = 0,
  once = true 
}) => {
  // Split text into characters, keeping spaces as &nbsp;
  const characters = text.split("").map(char => char === " " ? "\u00A0" : char);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const charVariants = {
    hidden: { y: "100%" },
    visible: {
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Premium heavy easing curve
      },
    },
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
    >
      {characters.map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="inline-block overflow-hidden align-bottom"
        >
          <motion.span 
            className="inline-block"
            variants={charVariants}
          >
            {char}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
};

export default AnimatedText;
