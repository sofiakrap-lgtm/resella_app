'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useApp } from '@/lib/state';
import { useTransition } from '@/lib/motion';
import { BellIcon } from './Icons';

/** Mocked push notifications, rendered inside the device frame. */
export function ToastHost() {
  const { toasts, dismissToast } = useApp();
  const transition = useTransition('sheet');

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-4 pt-14">
      <AnimatePresence>
        {toasts.map((toast) => {
          const body = (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-on-accent">
                <BellIcon size={18} />
              </span>
              <span className="min-w-0">
                <span className="t-subhead block font-semibold">{toast.title}</span>
                {toast.body ? (
                  <span className="t-caption1 block truncate text-ink-secondary">{toast.body}</span>
                ) : null}
              </span>
            </div>
          );
          return (
            <motion.div
              key={toast.id}
              initial={{ y: -24, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={transition}
              className="glass pointer-events-auto w-full max-w-[360px] rounded-[18px] px-3 py-2.5"
              role="status"
            >
              {toast.href ? (
                <Link href={toast.href} onClick={() => dismissToast(toast.id)} className="block">
                  {body}
                </Link>
              ) : (
                <button type="button" onClick={() => dismissToast(toast.id)} className="block w-full text-left">
                  {body}
                </button>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
