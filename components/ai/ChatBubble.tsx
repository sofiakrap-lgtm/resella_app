'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, type ReactNode } from 'react';
import { useApp } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { Mascot } from '@/components/ui/Mascot';

interface ChatBubbleProps {
  from: 'user' | 'assistant';
  children?: ReactNode;
  /** Assistant text revealed character by character, like a stream. */
  text?: string;
}

export function ChatBubble({ from, children, text }: ChatBubbleProps) {
  const transition = useTransition();
  const isUser = from === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
      className={`flex gap-2 px-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {isUser ? null : (
        <span className="mt-1 h-7 w-7 shrink-0">
          <Mascot pose="search" size={28} animate={false} />
        </span>
      )}
      <div
        className={[
          'max-w-[78%] rounded-[18px] px-3.5 py-2.5 t-body',
          isUser ? 'bg-accent text-on-accent' : 'bg-surface text-ink shadow-card',
        ].join(' ')}
      >
        {text !== undefined ? <StreamedText text={text} /> : children}
      </div>
    </motion.div>
  );
}

/** Reveals the reply progressively so the mock answer feels generated. */
function StreamedText({ text }: { text: string }) {
  const { motionEnabled } = useApp();
  const [shown, setShown] = useState(motionEnabled ? '' : text);

  useEffect(() => {
    if (!motionEnabled) {
      setShown(text);
      return;
    }
    setShown('');
    let index = 0;
    const timer = window.setInterval(() => {
      index += 2;
      setShown(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, 16);
    return () => window.clearInterval(timer);
  }, [text, motionEnabled]);

  return <span>{shown}</span>;
}
