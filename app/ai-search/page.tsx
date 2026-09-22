'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { answerQuery, AI_LATENCY_MS, SCRIPTED_QUERIES, type AIAnswer } from '@/lib/mockAI';
import type { Product } from '@/lib/mockData';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ChatBubble } from '@/components/ai/ChatBubble';
import { TypingIndicator } from '@/components/ai/TypingIndicator';
import { SuggestionChips } from '@/components/ai/SuggestionChips';
import { ProductCard } from '@/components/product/ProductCard';
import { QuickView } from '@/components/product/QuickView';
import { MarketCard } from '@/components/market/MarketCard';
import { Mascot } from '@/components/ui/Mascot';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ArrowRight, RouteIcon, SparkleIcon } from '@/components/ui/Icons';

interface Turn {
  id: string;
  question: string;
  answer: AIAnswer | null;
}

export default function AiSearchPage() {
  const { t } = useApp();
  const transition = useTransition();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, thinking]);

  const ask = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || thinking) return;
    const id = `turn-${Date.now()}`;
    setTurns((current) => [...current, { id, question: trimmed, answer: null }]);
    setInput('');
    setThinking(true);
    window.setTimeout(() => {
      const answer = answerQuery(trimmed);
      setTurns((current) => current.map((turn) => (turn.id === id ? { ...turn, answer } : turn)));
      setThinking(false);
    }, AI_LATENCY_MS);
  };

  return (
    <div className="pb-[176px]">
      <ScreenHeader
        title={t('ai.title')}
        back
        right={<SparkleIcon size={20} className="mr-2 text-accent" />}
      />

      <div className="flex items-start gap-3 px-4 py-4">
        <Mascot pose="search" size={48} />
        <p className="t-subhead flex-1 text-ink-secondary">{t('ai.scope')}</p>
      </div>

      {turns.length === 0 ? (
        <SuggestionChips title={t('ai.tryThese')} suggestions={SCRIPTED_QUERIES} onPick={ask} />
      ) : null}

      <div className="space-y-4 pt-2">
        {turns.map((turn) => (
          <div key={turn.id} className="space-y-3">
            <ChatBubble from="user">{turn.question}</ChatBubble>
            {turn.answer ? <AnswerBlock answer={turn.answer} onQuickView={setQuickView} onAsk={ask} /> : null}
          </div>
        ))}
        {thinking ? <TypingIndicator /> : null}
        <div ref={bottomRef} />
      </div>

      <p className="t-caption1 mt-6 px-4 text-center text-ink-tertiary">{t('ai.disclaimer')}</p>

      {/* Composer floats above the tab bar, on the navigation layer. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 px-4 pb-[94px]">
        <motion.form
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={transition}
          onSubmit={(event) => {
            event.preventDefault();
            ask(input);
          }}
          className="glass pointer-events-auto flex items-center gap-2 rounded-full py-1 pl-4 pr-1"
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t('ai.placeholder')}
            aria-label={t('ai.placeholder')}
            className="t-body min-h-11 min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-secondary"
          />
          <button
            type="submit"
            aria-label={t('ai.send')}
            disabled={!input.trim() || thinking}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent disabled:opacity-40"
          >
            <ArrowRight size={20} />
          </button>
        </motion.form>
      </div>

      <QuickView product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}

function AnswerBlock({
  answer,
  onQuickView,
  onAsk,
}: {
  answer: AIAnswer;
  onQuickView: (product: Product) => void;
  onAsk: (question: string) => void;
}) {
  const { t } = useApp();

  return (
    <div className="space-y-3">
      <ChatBubble from="assistant" text={answer.reply} />

      {answer.bullets.length ? (
        <div className="px-4 pl-[46px]">
          <ul className="space-y-1.5 rounded-[18px] bg-surface px-3.5 py-3 shadow-card">
            {answer.bullets.map((bullet) => (
              <li key={bullet} className="t-subhead flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {answer.markets.length ? (
        <section>
          <h3 className="t-footnote px-4 text-ink-secondary">{t('ai.marketsTitle')}</h3>
          <div className="hide-scrollbar mt-1.5 flex gap-3 overflow-x-auto px-4">
            {answer.markets.map((market, index) => (
              <MarketCard
                key={market.id}
                market={market}
                index={index}
                origin={answer.origin ?? undefined}
              />
            ))}
          </div>
        </section>
      ) : null}

      {answer.products.length ? (
        <section>
          <h3 className="t-footnote px-4 text-ink-secondary">{t('ai.resultsTitle')}</h3>
          <div className="hide-scrollbar mt-1.5 flex gap-3 overflow-x-auto px-4">
            {answer.products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} onQuickView={onQuickView} />
            ))}
          </div>
        </section>
      ) : null}

      {answer.action === 'route' ? (
        <div className="px-4">
          <Button
            variant="secondary"
            icon={<RouteIcon size={18} />}
            href={`/map?route=${answer.markets.map((market) => market.id).join(',')}${
              answer.origin ? '&origin=scandic' : ''
            }`}
          >
            {t('ai.planRoute')}
          </Button>
        </div>
      ) : null}

      {answer.followups.length ? (
        <div className="px-4">
          <p className="t-footnote mb-1.5 text-ink-secondary">{t('ai.followups')}</p>
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            {answer.followups.map((followup) => (
              <Chip key={followup} onClick={() => onAsk(followup)}>
                {followup}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
