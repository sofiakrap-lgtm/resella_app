/**
 * Mock iOS status bar. Only shown inside the desktop device frame, on a real
 * phone the operating system draws the real one.
 */
export function StatusBarMock() {
  return (
    <div className="relative hidden shrink-0 items-end justify-between px-8 pb-2 pt-3 md:flex" aria-hidden="true">
      <span className="t-footnote font-semibold tracking-tight">9.41</span>

      {/* Dynamic Island */}
      <span className="absolute left-1/2 top-2 h-[34px] w-[122px] -translate-x-1/2 rounded-full bg-black" />

      <span className="flex items-center gap-1.5">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0.5" width="3" height="11.5" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 10.8 6.1 8.9a2.7 2.7 0 0 1 3.8 0L8 10.8Z" />
          <path
            d="M3.3 6.2a6.7 6.7 0 0 1 9.4 0"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M0.9 3.6a10.1 10.1 0 0 1 14.2 0"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <span className="relative inline-flex h-[12px] w-[24px] items-center rounded-[4px] border border-current px-[2px] opacity-90">
          <span className="h-[7px] w-[15px] rounded-[2px] bg-current" />
          <span className="absolute -right-[3px] h-[4px] w-[2px] rounded-r bg-current" />
        </span>
      </span>
    </div>
  );
}
