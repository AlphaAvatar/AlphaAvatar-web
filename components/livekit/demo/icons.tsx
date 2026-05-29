export function AlphaLogo() {
  return (
    <div className="flex items-center gap-3.5">
      <div className="relative flex h-11 w-11 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-violet-500/20 blur-xl" />

        <svg
          viewBox="0 0 48 48"
          className="relative h-10 w-10 drop-shadow-[0_0_18px_rgba(139,92,246,0.45)]"
          fill="none"
        >
          <defs>
            <linearGradient
              id="alpha-logo-gradient"
              x1="8"
              y1="6"
              x2="40"
              y2="42"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#C4B5FD" />
              <stop offset="48%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>
          </defs>

          <path
            d="M24 6.5L41 39L27.4 31.8L24 39.3L20.6 31.8L7 39L24 6.5Z"
            stroke="url(#alpha-logo-gradient)"
            strokeWidth="4.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M24 16.5L31.5 31.2L26.5 28.6L24 34L21.5 28.6L16.5 31.2L24 16.5Z"
            stroke="url(#alpha-logo-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.55"
          />
        </svg>
      </div>

      <div className="text-[23px] font-semibold tracking-[-0.03em] text-white">
        AlphaAvatar
      </div>
    </div>
  );
}

export function IconVoice() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 0 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconVision() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h8A2.5 2.5 0 0 1 17 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-8A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.9"
      />
      <path
        d="m17 10 4-2.5v9L17 14"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconScreen() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4 5h16v11H4V5Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="M9 20h6M12 16v4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconChat() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M6.5 5.5h11A2.5 2.5 0 0 1 20 8v6.2a2.5 2.5 0 0 1-2.5 2.5H12l-4.8 3.1v-3.1h-.7A2.5 2.5 0 0 1 4 14.2V8a2.5 2.5 0 0 1 2.5-2.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10h8M8 13h5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M6 8h12M6 16h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 8a2 2 0 1 0 0 .01M15 16a2 2 0 1 0 0 .01"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconSend() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
      <path
        d="m21 3-9.2 18-2.2-7.6L3 10.8 21 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m10 14 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconPhoneOff() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M6.5 14.5c3.4-2.6 7.6-2.6 11 0l1.1.9a2 2 0 0 1 .3 2.8l-.8 1a2 2 0 0 1-2.4.5l-2.2-1a4 4 0 0 0-3 0l-2.2 1a2 2 0 0 1-2.4-.5l-.8-1a2 2 0 0 1 .3-2.8l1.1-.9Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}