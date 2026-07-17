import React, { useState, useEffect } from 'react';

const placeholders = [
  "Find SaaS companies in Bangalore with 20-100 employees...",
  "Search print shops in Kochi that could benefit from automation...",
  "Discover cloud consulting agencies in Mumbai...",
  "Find fintech startups in Delhi with seed funding...",
  "Locate AI software engineering labs in Hyderabad..."
];

export const TypewriterPlaceholder: React.FC = () => {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === placeholders[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), 2500); // Wait 2.5s before erasing
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % placeholders.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 40 : 80); // Fast erase, moderate write

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse]);

  useEffect(() => {
    setText(placeholders[index].substring(0, subIndex));
  }, [subIndex, index]);

  return (
    <span className="text-gray-500 font-sans text-sm inline-flex items-center pointer-events-none select-none">
      {text}
      <span className="w-1.5 h-4 bg-brand-500 ml-0.5 animate-pulse shrink-0" />
    </span>
  );
};
