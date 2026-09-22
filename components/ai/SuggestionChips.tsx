'use client';

import { motion } from 'framer-motion';
import { useStagger } from '@/lib/motion';
import { Chip } from '@/components/ui/Chip';

interface SuggestionChipsProps {
  title?: string;
  suggestions: string[];
  onPick: (suggestion: string) => void;
}

/** Quick start intents shown next to the free text field. */
export function SuggestionChips({ title, suggestions, onPick }: SuggestionChipsProps) {
  if (!suggestions.length) return null;
  return (
    <div className="px-4">
      {title ? <p className="t-footnote mb-2 text-ink-secondary">{title}</p> : null}
      <div className="flex flex-col gap-2">
        {suggestions.map((suggestion, index) => (
          <Suggestion key={suggestion} suggestion={suggestion} index={index} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}

function Suggestion({
  suggestion,
  index,
  onPick,
}: {
  suggestion: string;
  index: number;
  onPick: (value: string) => void;
}) {
  const transition = useStagger(index, 0.06);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={transition}>
      <Chip onClick={() => onPick(suggestion)} className="!h-auto min-h-11 w-full !justify-start py-2 text-left">
        <span className="line-clamp-2 text-left">{suggestion}</span>
      </Chip>
    </motion.div>
  );
}
