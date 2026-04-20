'use client';

import {
  useState,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase-browser';

const ACCENT = '#ff7a3a';

/* ---------- useInView ---------- */
function useInView(
  ref: React.RefObject<HTMLElement>,
  { once = true, margin = '0px' }: { once?: boolean; margin?: string } = {}
) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            if (once) io.disconnect();
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { rootMargin: margin, threshold: 0.05 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref, once, margin]);
  return inView;
}

/* ---------- Icons ---------- */
const Icon = {
  Globe: (p: { size?: number }) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 20}
      height={p.size || 20}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
  Arrow: (p: { size?: number }) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  ArrowUR: (p: { size?: number }) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 16}
      height={p.size || 16}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  ),
  Radar: (p: { size?: number }) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 22}
      height={p.size || 22}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 12l7-4" />
    </svg>
  ),
  Spark: (p: { size?: number }) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 22}
      height={p.size || 22}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v5M12 16v5M3 12h5M16 12h5M5.6 5.6l3.5 3.5M14.9 14.9l3.5 3.5M5.6 18.4l3.5-3.5M14.9 9.1l3.5-3.5" />
    </svg>
  ),
  Target: (p: { size?: number }) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 22}
      height={p.size || 22}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  Chat: (p: { size?: number }) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5A8 8 0 1 1 21 12z" />
    </svg>
  ),
  Up: (p: { size?: number }) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 14}
      height={p.size || 14}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  ),
  Insta: (p: { size?: number }) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  ),
  X: (p: { size?: number }) => (
    <svg
      viewBox="0 0 24 24"
      width={p.size || 18}
      height={p.size || 18}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  ),
};

/* ---------- Mascot ---------- */
type MascotProps = {
  size?: number;
  expression?: 'happy' | 'peek' | 'idle' | 'excited' | 'sleepy';
  talking?: boolean;
  accent?: string;
  onClick?: (e: React.MouseEvent) => void;
  running?: boolean;
  jumpTrigger?: number;
};

function Mascot({
  size = 72,
  expression = 'happy',
  talking = false,
  accent = ACCENT,
  onClick,
  running = false,
  jumpTrigger = 0,
}: MascotProps) {
  const [jumping, setJumping] = useState(false);

  useEffect(() => {
    if (!jumpTrigger) return;
    setJumping(true);
    const id = setTimeout(() => setJumping(false), 650);
    return () => clearTimeout(id);
  }, [jumpTrigger]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!jumping) {
      setJumping(true);
      setTimeout(() => setJumping(false), 650);
    }
    onClick?.(e);
  };

  const runActive = running && !jumping;

  const mouths: Record<string, ReactNode> = {
    idle: (
      <path
        d="M 62 84 Q 70 90 78 84"
        stroke="#1a1a1a"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
    ),
    happy: (
      <g>
        <path d="M 60 82 Q 70 94 80 82 Q 70 89 60 82 Z" fill="#1a1a1a" />
        <path d="M 66 88 L 66 92 L 69 92 L 69 88 Z" fill="#fff" />
      </g>
    ),
    peek: (
      <path
        d="M 62 86 Q 70 90 78 86"
        stroke="#1a1a1a"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
    ),
    excited: (
      <g>
        <path d="M 58 80 Q 70 96 82 80 Q 70 88 58 80 Z" fill="#1a1a1a" />
        <path d="M 64 86 L 64 91 L 68 91 L 68 86 Z" fill="#fff" />
      </g>
    ),
    sleepy: (
      <path
        d="M 62 86 L 78 86"
        stroke="#1a1a1a"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    ),
  };
  const mouth = mouths[expression];

  return (
    <svg
      onClick={handleClick}
      width={size}
      height={size * 1.28}
      viewBox="0 0 140 180"
      style={{
        overflow: 'visible',
        cursor: 'pointer',
        transform: jumping ? 'translateY(-44px)' : 'translateY(0)',
        transition: jumping
          ? 'transform 300ms cubic-bezier(.2,.9,.3,1)'
          : 'transform 360ms cubic-bezier(.3,1.6,.4,1)',
        pointerEvents: 'auto',
      }}
    >
      <ellipse
        cx="70"
        cy="172"
        rx={jumping ? 14 : runActive ? 22 : 26}
        ry={jumping ? 2 : 4}
        fill="#000"
        opacity={jumping ? 0.18 : 0.38}
        style={{ transition: 'all 280ms ease' }}
      />
      <g
        className={runActive ? 'run-bob' : ''}
        style={{
          transformOrigin: '70px 172px',
          transform: jumping ? 'scaleY(1.05) scaleX(0.97)' : undefined,
          transition: jumping ? 'transform 260ms ease' : undefined,
        }}
      >
        <g style={{ transformOrigin: '70px 48px' }} className="wiggle">
          <path
            d="M 70 48 Q 76 30 62 20"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle
            cx="60"
            cy="16"
            r="5.5"
            fill="#ffffff"
            stroke="#1a1a1a"
            strokeWidth="2.2"
          />
          <circle cx="60" cy="16" r="1.8" fill={accent} />
        </g>

        <g className={runActive ? 'run-head' : ''}>
          <g>
            <path
              d="M 38 52 Q 32 42 34 56 Z"
              fill="#ffffff"
              stroke="#1a1a1a"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path
              d="M 102 50 Q 110 40 106 58 Z"
              fill="#ffffff"
              stroke="#1a1a1a"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path
              d="M 34 78 C 34 54, 106 54, 106 78 C 106 102, 34 102, 34 78 Z"
              fill="#ffffff"
              stroke="#1a1a1a"
              strokeWidth="2.6"
            />
          </g>
          <path
            d="M 42 84 l 2.5 -2 l -2.5 -2 l 2.5 -2 l -2.5 -2"
            fill="none"
            stroke="#b5b5b5"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g>
            <ellipse className="eye-blink" cx="58" cy="72" rx="8" ry="10" fill={accent} />
            <ellipse className="eye-blink" cx="82" cy="72" rx="8" ry="10" fill={accent} />
            <ellipse cx="58" cy="73" rx="4" ry="5.5" fill="#b33613" opacity="0.55" />
            <ellipse cx="82" cy="73" rx="4" ry="5.5" fill="#b33613" opacity="0.55" />
            <circle cx="60" cy="68" r="1.8" fill="#fff" />
            <circle cx="84" cy="68" r="1.8" fill="#fff" />
          </g>
          {mouth}
          {talking && (
            <g>
              <circle cx="118" cy="60" r="3" fill={accent} />
              <circle cx="118" cy="60" r="3" fill={accent} opacity="0.3">
                <animate attributeName="r" values="3;9;3" dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.45;0;0.45" dur="1.4s" repeatCount="indefinite" />
              </circle>
            </g>
          )}
        </g>

        <g>
          <path
            d="M 52 112 C 48 118, 48 140, 52 146 L 52 150 C 52 156, 88 156, 88 150 L 88 146 C 92 140, 92 118, 88 112 Z"
            fill="#ffffff"
            stroke="#1a1a1a"
            strokeWidth="2.4"
          />
          <path
            d="M 70 116 Q 68 132 70 148"
            fill="none"
            stroke="#b5b5b5"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>

        <g
          className={runActive ? 'run-arm-back' : ''}
          style={
            !runActive
              ? {
                  transformOrigin: '88px 118px',
                  transform: jumping ? 'rotate(32deg)' : 'rotate(-8deg)',
                  transition: 'transform 260ms ease',
                }
              : undefined
          }
        >
          <path
            d="M 88 116 Q 97 128 99 142"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M 86 114 Q 94 124 97 138 L 101 137 Q 99 123 91 112 Z"
            fill="#ffffff"
            stroke="#1a1a1a"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <circle cx="99" cy="142" r="6" fill="#ffffff" stroke="#1a1a1a" strokeWidth="2.2" />
          <path d="M 96 143 L 102 143" stroke="#b5b5b5" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        <g
          className={runActive ? 'run-leg-back' : ''}
          style={
            !runActive
              ? {
                  transformOrigin: '78px 150px',
                  transform: jumping ? 'rotate(-10deg) translateY(-6px)' : 'rotate(0deg)',
                  transition: 'transform 260ms ease',
                }
              : undefined
          }
        >
          <path
            d={
              jumping
                ? 'M 70 150 L 70 164 L 82 164 Q 84 158 80 150 Z'
                : 'M 70 150 L 70 168 L 84 168 Q 86 160 80 150 Z'
            }
            fill="#ffffff"
            stroke="#1a1a1a"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <ellipse
            cx={jumping ? 76 : 77}
            cy={jumping ? 164 : 169}
            rx="7"
            ry="2.5"
            fill="#1a1a1a"
            opacity="0.85"
          />
        </g>

        <g
          className={runActive ? 'run-leg-front' : ''}
          style={
            !runActive
              ? {
                  transformOrigin: '66px 150px',
                  transform: jumping ? 'rotate(12deg) translateY(-6px)' : 'rotate(0deg)',
                  transition: 'transform 260ms ease',
                }
              : undefined
          }
        >
          <path
            d={
              jumping
                ? 'M 62 150 Q 58 158 60 164 L 70 164 L 70 150 Z'
                : 'M 62 150 Q 58 162 60 168 L 70 168 L 70 150 Z'
            }
            fill="#ffffff"
            stroke="#1a1a1a"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <ellipse
            cx={jumping ? 63 : 64}
            cy={jumping ? 164 : 169}
            rx="7"
            ry="2.5"
            fill="#1a1a1a"
            opacity="0.85"
          />
        </g>

        <g
          className={runActive ? 'run-arm-front' : ''}
          style={
            !runActive
              ? {
                  transformOrigin: '52px 118px',
                  transform: jumping ? 'rotate(-32deg)' : 'rotate(8deg)',
                  transition: 'transform 260ms ease',
                }
              : undefined
          }
        >
          <path
            d="M 52 116 Q 43 128 41 142"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M 54 114 Q 46 124 43 138 L 39 137 Q 41 123 49 112 Z"
            fill="#ffffff"
            stroke="#1a1a1a"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          <circle cx="41" cy="142" r="6" fill="#ffffff" stroke="#1a1a1a" strokeWidth="2.2" />
          <path d="M 38 143 L 44 143" stroke="#b5b5b5" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

/* ---------- WalkingMascot ---------- */
type DustPuff = { id: number; side: number };

function WalkingMascot({ accent }: { accent: string }) {
  const [phase, setPhase] = useState(0);
  const [jumpCount, setJumpCount] = useState(0);
  const [dir, setDir] = useState(1);
  const [dust, setDust] = useState<DustPuff[]>([]);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const lastJumpRef = useRef(0);
  const jumpingRef = useRef(false);

  useEffect(() => {
    startRef.current = performance.now();
    const tick = (t: number) => {
      const elapsed = (t - startRef.current) / 1000;
      const period = 10;
      const p = (elapsed % period) / period;
      setPhase(p);
      setDir(p < 0.5 ? 1 : -1);

      if (t - lastJumpRef.current > 3200 + Math.random() * 2000 && !jumpingRef.current) {
        lastJumpRef.current = t;
        jumpingRef.current = true;
        setJumpCount((c) => c + 1);
        setDust((d) => [...d, { id: t, side: Math.random() > 0.5 ? 1 : -1 }]);
        setTimeout(() => {
          jumpingRef.current = false;
        }, 700);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!dust.length) return;
    const id = setTimeout(() => setDust((d) => d.slice(1)), 700);
    return () => clearTimeout(id);
  }, [dust]);

  const pct = phase < 0.5 ? phase * 2 : 1 - (phase - 0.5) * 2;
  const xPct = 6 + pct * 82;
  const leanDeg = 4;

  return (
    <div className="pointer-events-none absolute inset-x-0 z-[15]" style={{ bottom: '16%' }}>
      <div className="relative w-full h-0">
        <div
          style={{
            position: 'absolute',
            left: `${xPct}%`,
            transform: `translate(-50%, 0) scaleX(${dir}) rotate(${leanDeg}deg)`,
            transition: 'transform 80ms linear, left 0s',
            pointerEvents: 'auto',
          }}
          title="Give Kora a high-five!"
        >
          <Mascot size={92} expression="happy" accent={accent} running jumpTrigger={jumpCount} />
          {dust.map((d) => (
            <span
              key={d.id}
              className="dust absolute pointer-events-none"
              style={
                {
                  '--dx': `${d.side * 20}px`,
                  bottom: '2px',
                  left: '50%',
                  width: 10,
                  height: 5,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.35)',
                  transform: 'translateX(-50%)',
                  filter: 'blur(1px)',
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Feed ---------- */
type FeedItem = {
  sub: string;
  title: string;
  score: number;
  comments: number;
  intent: 'HIGH' | 'MED' | 'LOW';
};

const FEED_ITEMS: FeedItem[] = [
  { sub: 'r/indiehackers', title: 'What tools actually helped you land your first 10 customers?', score: 342, comments: 87, intent: 'HIGH' },
  { sub: 'r/SaaS', title: "Cold outbound is dead. What's working for you in 2026?", score: 218, comments: 54, intent: 'HIGH' },
  { sub: 'r/marketing', title: 'Reddit is underrated for B2B. Change my mind.', score: 611, comments: 212, intent: 'MED' },
  { sub: 'r/startups', title: 'Founders — how are you tracking intent signals?', score: 129, comments: 41, intent: 'HIGH' },
  { sub: 'r/Entrepreneur', title: "Spent $0 on ads, got 300 signups. Here's the playbook.", score: 1120, comments: 402, intent: 'LOW' },
  { sub: 'r/growthhacking', title: 'Anyone automating community listening without being spammy?', score: 76, comments: 19, intent: 'HIGH' },
  { sub: 'r/smallbusiness', title: 'Best way to find people already looking for your product?', score: 254, comments: 88, intent: 'HIGH' },
  { sub: 'r/sales', title: "What's replaced LinkedIn Sales Nav in your stack?", score: 188, comments: 63, intent: 'MED' },
];

function FeedTile({ it, accent }: { it: FeedItem; accent: string }) {
  const intentColor = it.intent === 'HIGH' ? accent : it.intent === 'MED' ? '#9aa0a6' : '#555';
  return (
    <div className="liquid-glass rounded-2xl p-4 w-[340px] shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <span className="h-5 w-5 rounded-full bg-white/10 grid place-items-center text-[10px] font-semibold text-white/70">
            {it.sub[2].toUpperCase()}
          </span>
          <span>{it.sub}</span>
          <span className="text-white/25">· 1h</span>
        </div>
        <span className="text-[10px] tracking-[0.14em] font-medium" style={{ color: intentColor }}>
          {it.intent} INTENT
        </span>
      </div>
      <div className="text-sm text-white leading-snug mb-3 pretty">{it.title}</div>
      <div className="flex items-center gap-3 text-[11px] text-white/40">
        <span className="inline-flex items-center gap-1">
          <Icon.Up size={12} />
          {it.score}
        </span>
        <span className="inline-flex items-center gap-1">
          <Icon.Chat size={12} />
          {it.comments}
        </span>
        <span className="ml-auto text-white/60 inline-flex items-center gap-1">
          Draft reply <Icon.ArrowUR size={12} />
        </span>
      </div>
    </div>
  );
}

/* ---------- Hero (with Supabase magic-link) ---------- */
function Hero({ accent }: { accent: string }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('sending');
    setErrorMsg(null);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/api/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
      return;
    }
    setStatus('sent');
  }

  const submitting = status === 'sending';
  const sent = status === 'sent';

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col grain">
      <div className="absolute inset-0 hero-ambient" />
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.08]"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        {[...Array(12)].map((_, i) => (
          <circle key={i} cx="600" cy="520" r={60 + i * 55} fill="none" stroke="white" strokeWidth="0.6" />
        ))}
        <line x1="0" y1="520" x2="1200" y2="520" stroke="white" strokeWidth="0.5" strokeDasharray="2 6" />
      </svg>

      <div
        className="hidden lg:block absolute right-6 top-0 bottom-0 w-[360px] overflow-hidden z-[5]"
        style={{
          maskImage:
            'linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)',
        }}
      >
        <div className="feed-scroll flex flex-col gap-3 pt-8">
          {[...FEED_ITEMS, ...FEED_ITEMS].map((it, i) => (
            <FeedTile key={i} it={it} accent={accent} />
          ))}
        </div>
      </div>

      <div
        className="hidden lg:block absolute left-6 top-0 bottom-0 w-[360px] overflow-hidden z-[5]"
        style={{
          maskImage:
            'linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)',
        }}
      >
        <div className="feed-scroll-reverse flex flex-col gap-3 pt-8">
          {[...FEED_ITEMS.slice().reverse(), ...FEED_ITEMS.slice().reverse()].map((it, i) => (
            <FeedTile key={i} it={it} accent={accent} />
          ))}
        </div>
      </div>

      <nav className="z-20 w-full flex justify-center pt-6 px-4">
        <div className="liquid-glass rounded-full max-w-5xl w-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${accent}, #c2421a 80%)`,
                  }}
                />
                <div className="absolute inset-[5px] rounded-full bg-black/70 grid place-items-center">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                </div>
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">Karmora</span>
            </div>
            <div className="hidden md:flex items-center gap-7 text-sm text-white/70 font-medium">
              <a href="#how" className="nav-link hover:text-white transition">How it works</a>
              <a href="#pricing" className="nav-link hover:text-white transition">Pricing</a>
              <a href="#manifesto" className="nav-link hover:text-white transition">Manifesto</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#signup" className="text-white/80 hover:text-white text-sm font-medium">
              Sign up
            </a>
            <a
              href="#signup"
              className="liquid-glass rounded-full px-5 py-2 text-sm font-medium text-white hover:bg-white/5 transition"
            >
              Login
            </a>
          </div>
        </div>
      </nav>

      <div
        className="relative flex-1 flex flex-col items-center justify-center text-center px-6 z-10"
        style={{ transform: 'translateY(-4%)' }}
      >
        <div className="liquid-glass rounded-full px-4 py-1.5 text-[11px] tracking-[0.18em] text-white/70 mb-8 inline-flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
          LIVE · 4,812 THREADS SCANNED IN THE LAST HOUR
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl text-white tracking-tight balance max-w-2xl mb-6 leading-[1.05]">
          <span>High-intent </span>
          <span className="serif-i text-white/70">conversations</span>
          <span>,</span>
          <br />
          <span>found </span>
          <span className="serif-i text-white/70">before</span>
          <span> they go viral.</span>
        </h1>

        <p className="text-white/60 text-base md:text-lg max-w-xl mb-8 pretty leading-relaxed">
          Karmora watches Reddit so you don&apos;t have to — and surfaces only the conversations worth
          joining.
        </p>

        <form
          id="signup"
          onSubmit={onSubmit}
          className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-2 w-full max-w-md mb-4"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            disabled={submitting || sent}
            className="bg-transparent text-white placeholder-white/40 text-sm flex-1 outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={submitting || sent || !email}
            className="w-10 h-10 rounded-full grid place-items-center text-black transition hover:scale-105 disabled:opacity-70"
            style={{ background: sent ? '#fff' : accent }}
          >
            <Icon.Arrow size={18} />
          </button>
        </form>
        <p className="text-white/40 text-xs mb-10">
          {sent
            ? `Magic link sent to ${email}. Check your inbox.`
            : status === 'error'
            ? errorMsg || 'Something went wrong. Try again.'
            : submitting
            ? 'Sending magic link...'
            : 'Join 1,200+ founders getting the daily intent digest.'}
        </p>

        <div className="flex items-center gap-3">
          <a
            href="#manifesto"
            className="liquid-glass rounded-full px-7 py-3 text-sm font-medium text-white hover:bg-white/5 transition"
          >
            Read the Manifesto
          </a>
          <a
            href="#how"
            className="rounded-full px-7 py-3 text-sm font-medium text-black transition hover:scale-[1.02]"
            style={{ background: accent }}
          >
            See it in action →
          </a>
        </div>
      </div>

      <WalkingMascot accent={accent} />

      <div className="relative z-10 flex items-center justify-center gap-3 pb-8">
        {[Icon.Insta, Icon.X, Icon.Globe].map((I, i) => (
          <button
            key={i}
            className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition"
          >
            <I size={18} />
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------- About + How pipeline ---------- */
function About({ accent }: { accent: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    {
      n: '01',
      t: 'Learns your product',
      d: 'Paste a URL or a pitch. Karmora builds a semantic fingerprint of what you actually do.',
      I: Icon.Spark,
    },
    {
      n: '02',
      t: 'Maps your ICP',
      d: 'Industry, role, pain points, and where they already hang out online.',
      I: Icon.Target,
    },
    {
      n: '03',
      t: 'Watches, hourly',
      d: 'The right subreddits, scanned every 60 minutes. No polling storms.',
      I: Icon.Radar,
    },
    {
      n: '04',
      t: 'Hands you a reply',
      d: 'A value-first draft, in your voice, grounded in the thread.',
      I: Icon.Chat,
    },
  ];

  return (
    <section
      id="how"
      ref={ref}
      className="relative bg-black pt-32 md:pt-44 pb-10 md:pb-14 px-6"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at top, rgba(255,255,255,0.03) 0%, transparent 70%)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-white/40 text-sm tracking-[0.22em] uppercase mb-10 flex items-center gap-3 transition-opacity duration-700 ${
            inView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="h-px w-10 bg-white/20" /> About Karmora
        </div>

        <div className="mb-16">
          <h2 className="text-4xl md:text-6xl lg:text-7xl text-white leading-[1.08] tracking-tight balance">
            Built for founders who sell with <span className="serif-i text-white/60">empathy</span>,
            <br className="hidden md:block" /> not with <span className="serif-i text-white/60">noise</span>. We read{' '}
            <span className="serif-i text-white/60">the room</span>,
            <br className="hidden md:block" /> so you can <span className="serif-i text-white/60">join</span> the right one.
          </h2>
        </div>

        <div className="relative rounded-3xl overflow-hidden aspect-video liquid-glass mb-10 md:mb-14 group cursor-pointer">
          <div className="absolute inset-0 stripes" />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255,122,58,0.08) 0%, transparent 60%)',
            }}
          />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 2 8 L 2 2 L 8 2" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
            <path d="M 92 2 L 98 2 L 98 8" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
            <path d="M 98 92 L 98 98 L 92 98" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
            <path d="M 8 98 L 2 98 L 2 92" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-white/50 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              REC · 00:00 / 00:00
            </div>
            <div className="text-[10px] tracking-[0.22em] text-white/40 font-mono">
              KARMORA / DEMO · v0.1 · PLACEHOLDER
            </div>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-5">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: accent, opacity: 0.25 }}
              />
              <div
                className="relative w-20 h-20 rounded-full grid place-items-center liquid-glass transition group-hover:scale-105"
                style={{ boxShadow: `0 10px 40px ${accent}55` }}
              >
                <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff">
                  <path d="M8 5 L8 19 L20 12 Z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/50 text-[11px] tracking-[0.24em] uppercase mb-2">Drop demo video here</div>
              <div className="text-white text-xl md:text-2xl tracking-tight">A 90-second walkthrough of Karmora</div>
              <div className="text-white/40 text-sm mt-1 font-mono">[ ASPECT 16:9 · 1920×1080 · MP4/WEBM ]</div>
            </div>
          </div>
          <div className="absolute left-5 right-5 bottom-5 z-10">
            <div className="h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '0%', background: accent }} />
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] tracking-[0.22em] text-white/40 font-mono">
              <span>◻ FULLSCREEN</span>
              <span>⊙ CC</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 md:gap-6">
          {steps.map((s) => (
            <div key={s.n} className="liquid-glass rounded-3xl p-6 lift">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] tracking-[0.2em] text-white/40">{s.n}</span>
                <span className="text-white/60">
                  <s.I size={20} />
                </span>
              </div>
              <div className="text-white text-lg tracking-tight mb-2">{s.t}</div>
              <p className="text-white/50 text-sm leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FeaturedBlock ---------- */
function FeaturedBlock({ accent }: { accent: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(96, v + 2 + Math.random() * 3);
      setScore(Math.round(v));
      if (v >= 96) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [inView]);

  return (
    <section ref={ref} className="relative bg-black pt-6 md:pt-10 pb-20 md:pb-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden aspect-video liquid-glass">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 30% 60%, rgba(255,122,58,0.18), transparent 55%),
                radial-gradient(circle at 75% 40%, rgba(255,122,58,0.08), transparent 60%),
                linear-gradient(180deg, #0a0a0a 0%, #000 100%)`,
            }}
          />
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1200 675"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={accent} stopOpacity="0" />
                <stop offset="100%" stopColor={accent} stopOpacity="0.35" />
              </linearGradient>
            </defs>
            {[...Array(10)].map((_, i) => (
              <circle key={i} cx="280" cy="420" r={40 + i * 55} fill="none" stroke="white" strokeOpacity="0.08" />
            ))}
            <g transform="translate(280,420)">
              <path d="M 0 0 L 260 -40 A 280 280 0 0 0 260 40 Z" fill="url(#sweep)">
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="6s" repeatCount="indefinite" />
              </path>
            </g>
            {[
              { x: 420, y: 320, r: 3, hot: true },
              { x: 540, y: 260, r: 4, hot: false },
              { x: 760, y: 380, r: 5, hot: true },
              { x: 880, y: 230, r: 3, hot: false },
              { x: 1000, y: 320, r: 4, hot: false },
              { x: 640, y: 500, r: 6, hot: true },
              { x: 900, y: 500, r: 3, hot: false },
            ].map((d, i) => (
              <g key={i}>
                <circle cx={d.x} cy={d.y} r={d.r} fill={d.hot ? accent : '#fff'} opacity={d.hot ? 1 : 0.6}>
                  <animate
                    attributeName="opacity"
                    values={d.hot ? '1;0.4;1' : '0.6;0.2;0.6'}
                    dur="2.2s"
                    repeatCount="indefinite"
                    begin={`${i * 0.3}s`}
                  />
                </circle>
                {d.hot && (
                  <circle cx={d.x} cy={d.y} r={d.r} fill="none" stroke={accent} strokeOpacity="0.6">
                    <animate attributeName="r" values={`${d.r};${d.r + 22}`} dur="2.2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                    <animate attributeName="stroke-opacity" values="0.6;0" dur="2.2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                  </circle>
                )}
              </g>
            ))}
          </svg>

          <div className="absolute inset-0 pointer-events-none">
            {[
              { t: 'r/SaaS', x: '46%', y: '42%' },
              { t: 'r/indiehackers', x: '68%', y: '60%' },
              { t: 'r/startups', x: '78%', y: '30%' },
              { t: 'r/growthhacking', x: '52%', y: '72%' },
            ].map((l, i) => (
              <div
                key={i}
                className="absolute text-[11px] tracking-wider text-white/50 font-medium"
                style={{ left: l.x, top: l.y }}
              >
                {l.t}
              </div>
            ))}
          </div>

          <div className="absolute right-6 md:right-10 top-8 md:top-10 w-[300px] md:w-[360px] liquid-glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2 text-[10px] tracking-[0.18em] text-white/40">
              <span>DETECTED · r/SaaS</span>
              <span style={{ color: accent }}>INTENT SCORE {score}</span>
            </div>
            <div className="text-sm text-white leading-snug mb-3">
              &quot;Tired of cold DMs. Is there a tool that surfaces posts where someone literally asks for what I built?&quot;
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
              <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: accent }} />
            </div>
            <div className="text-[11px] text-white/40 mb-3">Suggested reply — value-first, no link</div>
            <div className="text-xs text-white/70 leading-relaxed pretty">
              &quot;I&apos;d start by asking what &apos;asking for it&apos; looks like in your niche. In B2B SaaS I&apos;ve seen patterns around pricing frustration, bad onboarding, and ...&quot;
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button className="text-[11px] text-black rounded-full px-3 py-1.5 font-medium" style={{ background: accent }}>
                Copy reply
              </button>
              <button className="text-[11px] text-white/70 rounded-full px-3 py-1.5 font-medium liquid-glass">
                Regenerate
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="liquid-glass rounded-2xl p-6 md:p-8 max-w-md">
              <div className="text-white/50 text-xs tracking-[0.2em] uppercase mb-3">Our approach</div>
              <p className="text-white text-sm md:text-base leading-relaxed pretty">
                We don&apos;t spam Reddit. We translate what your ICP is already saying into conversations you&apos;re uniquely qualified to join.
              </p>
            </div>
            <a
              href="#signup"
              className="liquid-glass rounded-full px-8 py-3 text-sm font-medium text-white hover:bg-white/5 transition"
            >
              Watch a 90-second demo →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Philosophy ---------- */
function TypedText({ active, text }: { active: boolean; text: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    setI(0);
    const id = setInterval(() => {
      setI((x) => {
        if (x >= text.length) {
          clearInterval(id);
          return x;
        }
        return x + 1;
      });
    }, 18);
    return () => clearInterval(id);
  }, [active, text]);
  return (
    <div className="text-white text-sm leading-relaxed pretty">
      {text.slice(0, i)}
      <span
        className="inline-block w-[2px] h-[1em] align-middle ml-0.5"
        style={{
          background: '#fff',
          opacity: i < text.length ? 1 : 0,
          animation: 'blink 1s steps(1) infinite',
        }}
      />
    </div>
  );
}

function Philosophy({ accent }: { accent: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="manifesto" ref={ref} className="relative bg-black py-28 md:py-40 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl md:text-7xl lg:text-8xl text-white tracking-tight mb-16 md:mb-24 balance">
          Listen <span className="serif-i text-white/40">×</span> Contribute
        </h2>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] liquid-glass p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span className="h-5 w-5 rounded-full bg-white/10 grid place-items-center text-[10px]">i</span>
                  r/indiehackers · 2h
                </div>
                <span className="text-[10px] tracking-[0.18em]" style={{ color: accent }}>
                  HIGH INTENT · 94
                </span>
              </div>
              <p className="text-white text-base md:text-lg leading-snug mb-4 pretty">
                &quot;Solo founder here. How are you finding customers{' '}
                <span className="serif-i text-white/60">without</span> running ads or cold DMs?&quot;
              </p>
              <div className="flex items-center gap-3 text-[11px] text-white/40">
                <span className="inline-flex items-center gap-1">
                  <Icon.Up size={12} /> 248
                </span>
                <span className="inline-flex items-center gap-1">
                  <Icon.Chat size={12} /> 74
                </span>
              </div>
            </div>

            <div className="liquid-glass rounded-2xl p-4 mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Mascot size={28} expression="happy" accent={accent} />
                <div className="text-[10px] tracking-[0.18em] text-white/40">KARMORA · DRAFT IN YOUR VOICE</div>
              </div>
              <TypedText
                active={inView}
                text={
                  "I've been tracking this exact question for the last year. The short answer: go where people are already describing the problem you solve — and comment, don't pitch. Here's the framework I use..."
                }
              />
            </div>
          </div>

          <div className="flex flex-col justify-center gap-8">
            <div>
              <div className="text-white/40 text-xs tracking-[0.2em] uppercase mb-4">Read the room</div>
              <p className="text-white/70 text-base md:text-lg leading-relaxed pretty">
                Good Reddit replies come from people who actually lurked first. Karmora does the lurking — pattern-matching tone, upvoted norms, and unwritten rules of each community — so your reply lands like a regular, not a drive-by.
              </p>
            </div>
            <div className="w-full h-px bg-white/10" />
            <div>
              <div className="text-white/40 text-xs tracking-[0.2em] uppercase mb-4">Value before link</div>
              <p className="text-white/70 text-base md:text-lg leading-relaxed pretty">
                We generate replies that would be worth posting even if your product didn&apos;t exist. Karma first, pipeline second. That&apos;s how you get invited back.
              </p>
            </div>
            <div className="w-full h-px bg-white/10" />
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-black"
                    style={{
                      background: `linear-gradient(135deg, ${['#ff7a3a', '#f1e7d4', '#9aa0a6'][i]}, #000)`,
                    }}
                  />
                ))}
              </div>
              <div className="text-white/50 text-sm">Trusted by 1,200+ founders shipping in public.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Services ---------- */
function RadarVisual({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 55%, #1a0d06 0%, #000 70%)' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sweep2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.45" />
          </linearGradient>
        </defs>
        {[...Array(7)].map((_, i) => (
          <circle key={i} cx="300" cy="180" r={30 + i * 28} fill="none" stroke="white" strokeOpacity="0.08" />
        ))}
        <g transform="translate(300,180)">
          <path d="M 0 0 L 200 -40 A 205 205 0 0 0 200 40 Z" fill="url(#sweep2)">
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="5s" repeatCount="indefinite" />
          </path>
        </g>
        {[
          { x: 220, y: 130 },
          { x: 380, y: 210 },
          { x: 430, y: 120 },
          { x: 180, y: 230 },
          { x: 330, y: 260 },
        ].map((d, i) => (
          <g key={i}>
            <circle cx={d.x} cy={d.y} r="3" fill={accent}>
              <animate attributeName="opacity" values="1;0.3;1" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={d.x} cy={d.y} r="3" fill="none" stroke={accent} strokeOpacity="0.5">
              <animate attributeName="r" values="3;22" dur="2.2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.5;0" dur="2.2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-4 left-5 text-[11px] tracking-[0.2em] text-white/40">HOURLY SWEEP · 38 SUBS</div>
      <div className="absolute top-4 right-5 text-[11px] tracking-[0.2em]" style={{ color: accent }}>
        ● LIVE
      </div>
    </div>
  );
}

function TypewriterSmall({ text }: { text: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    const id = setInterval(() => {
      setI((x) => {
        if (x >= text.length) {
          clearInterval(id);
          return x;
        }
        return x + 1;
      });
    }, 22);
    return () => clearInterval(id);
  }, [text]);
  return (
    <span>
      {text.slice(0, i)}
      <span style={{ opacity: i < text.length ? 1 : 0 }}>▍</span>
    </span>
  );
}

function ComposeVisual({ accent }: { accent: string }) {
  return (
    <div
      className="absolute inset-0 p-5 flex flex-col gap-2"
      style={{ background: 'linear-gradient(180deg,#0b0806, #000)' }}
    >
      <div className="liquid-glass rounded-xl p-3">
        <div className="text-[10px] tracking-[0.18em] text-white/40 mb-1">r/startups · thread</div>
        <div className="text-xs text-white/80 leading-snug">
          &quot;What&apos;s the best way to learn your customer without surveying them to death?&quot;
        </div>
      </div>
      <div className="flex items-start gap-2">
        <Mascot size={32} expression="happy" accent={accent} />
        <div className="liquid-glass rounded-xl p-3 flex-1">
          <div className="text-[10px] tracking-[0.18em]" style={{ color: accent }}>
            DRAFT · VALUE FIRST
          </div>
          <div className="text-xs text-white leading-relaxed mt-1">
            <TypewriterSmall text="Read 10 existing threads before you ask anything. The patterns are already there — hiring posts, rant posts, and 'is there a tool that...' posts are gold." />
          </div>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-2">
        <span className="text-[10px] rounded-full px-2 py-1 liquid-glass text-white/60">Tone: curious</span>
        <span className="text-[10px] rounded-full px-2 py-1 liquid-glass text-white/60">No link</span>
        <span className="text-[10px] rounded-full px-2 py-1 liquid-glass text-white/60">128 words</span>
      </div>
    </div>
  );
}

function Services({ accent }: { accent: string }) {
  const cards = [
    {
      tag: 'LISTEN',
      title: 'Intent Radar',
      desc: 'Every hour, we sweep the subreddits your ICP lives in, and surface only the threads that match your wedge.',
      Visual: () => <RadarVisual accent={accent} />,
    },
    {
      tag: 'REPLY',
      title: 'Drafts, in your voice',
      desc: "Value-first replies grounded in the thread, matched to each subreddit's tone, ready to paste or tweak.",
      Visual: () => <ComposeVisual accent={accent} />,
    },
  ];

  return (
    <section
      className="relative bg-black py-28 md:py-40 px-6"
      style={{
        backgroundImage: 'radial-gradient(ellipse at center, rgba(255,255,255,0.02) 0%, transparent 60%)',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-16 gap-6">
          <h3 className="text-3xl md:text-5xl text-white tracking-tight balance">
            What Karmora <span className="serif-i text-white/50">actually</span> does.
          </h3>
          <div className="text-white/40 text-sm hidden md:block tracking-wide">Two loops, running hourly.</div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {cards.map((c) => (
            <div key={c.tag} className="group liquid-glass rounded-3xl overflow-hidden lift">
              <div className="relative aspect-video overflow-hidden">
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.05]">
                  <c.Visual />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/40 text-xs tracking-[0.2em] uppercase">{c.tag}</span>
                  <span className="liquid-glass rounded-full p-2 text-white/60 group-hover:text-white transition">
                    <Icon.ArrowUR size={16} />
                  </span>
                </div>
                <div className="text-white text-xl md:text-2xl mb-3 tracking-tight">{c.title}</div>
                <p className="text-white/50 text-sm leading-relaxed pretty">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 md:mt-32 text-center">
          <div className="text-white/40 text-xs tracking-[0.22em] uppercase mb-5">Ready?</div>
          <h4 className="text-4xl md:text-6xl text-white tracking-tight balance mb-8">
            Your next customer is <span className="serif-i text-white/60">already</span> typing.
          </h4>
          <div className="flex items-center justify-center gap-3">
            <a
              href="#signup"
              className="rounded-full px-7 py-3 text-sm font-medium text-black"
              style={{ background: accent }}
            >
              Claim your spot →
            </a>
            <a
              href="#how"
              className="liquid-glass rounded-full px-7 py-3 text-sm font-medium text-white"
            >
              Book a walkthrough
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing ---------- */
function Pricing({ accent }: { accent: string }) {
  const [annual, setAnnual] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const Check = ({ on = true }: { on?: boolean }) => (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" className="shrink-0 mt-0.5">
      <circle cx="10" cy="10" r="9" fill="none" stroke={on ? accent : '#404040'} strokeWidth="1.4" opacity={on ? 1 : 0.6} />
      <path
        d="M 6 10 L 9 13 L 14 7"
        fill="none"
        stroke={on ? accent : '#737373'}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const Feature = ({ children, on = true }: { children: ReactNode; on?: boolean }) => (
    <li className="flex items-start gap-3 text-sm leading-relaxed">
      <Check on={on} />
      <span className={on ? 'text-neutral-200' : 'text-neutral-500'}>{children}</span>
    </li>
  );

  const onToggleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setAnnual(true);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setAnnual(false);
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setAnnual((a) => !a);
    }
  };

  return (
    <section
      id="pricing"
      ref={ref}
      className="relative bg-[#0a0a0a] py-28 md:py-36 px-6 border-t border-neutral-900"
      style={{ scrollMarginTop: '80px' }}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className={`text-center mb-10 md:mb-14 transition-opacity duration-700 ${
            inView ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="text-neutral-500 text-xs tracking-[0.22em] uppercase mb-4">Pricing</div>
          <h2 className="text-4xl md:text-5xl text-neutral-100 tracking-tight mb-3">
            Simple pricing. <span className="serif-i text-neutral-400">Ship this week.</span>
          </h2>
          <p className="text-neutral-500 text-base max-w-xl mx-auto">
            Start free. Upgrade when Karmora has already found conversations worth joining.
          </p>
        </div>

        <div className="flex items-center justify-center mb-10">
          <div
            role="radiogroup"
            aria-label="Billing period"
            tabIndex={0}
            onKeyDown={onToggleKey}
            className="relative inline-flex items-center rounded-lg border border-neutral-800 bg-neutral-950 p-1 focus:outline-none focus:ring-2"
            style={{ ['--tw-ring-color' as string]: accent } as CSSProperties}
          >
            <span
              aria-hidden="true"
              className="absolute top-1 bottom-1 rounded-md bg-neutral-100 transition-transform duration-300 ease-out"
              style={{
                left: '6px',
                width: 'calc(50% - 10px)',
                transform: annual ? 'translateX(calc(100% + 8px))' : 'translateX(0)',
              }}
            />
            <button
              role="radio"
              aria-checked={!annual}
              onClick={() => setAnnual(false)}
              className={`relative z-10 px-5 py-2 text-sm font-medium rounded-md transition-colors ${
                !annual ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Monthly
            </button>
            <button
              role="radio"
              aria-checked={annual}
              onClick={() => setAnnual(true)}
              className={`relative z-10 px-5 py-2 text-sm font-medium rounded-md transition-colors inline-flex items-center gap-2 ${
                annual ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Annual
              <span
                className="text-[10px] tracking-wider font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: annual ? 'rgba(255,69,0,0.15)' : 'rgba(255,69,0,0.12)',
                  color: accent,
                  border: `1px solid ${accent}55`,
                }}
              >
                SAVE 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          <div className="rounded-lg border border-neutral-800 bg-[#0a0a0a] p-7 md:p-8 flex flex-col">
            <div className="mb-6">
              <div className="text-neutral-400 text-sm font-medium mb-3">Free</div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl text-neutral-100 tracking-tight font-medium">$0</span>
                <span className="text-neutral-500 text-sm">/forever</span>
              </div>
              <div className="text-neutral-500 text-sm mt-2">Try Karmora, no card required.</div>
            </div>
            <ul className="space-y-3 mb-8">
              <Feature>1 project</Feature>
              <Feature>20 leads per month</Feature>
              <Feature>3 AI openers per day</Feature>
              <Feature>Safe mode openers only</Feature>
              <Feature>Viral post templates</Feature>
              <Feature>Reddit engagement tips</Feature>
            </ul>
            <a
              href="#signup"
              className="mt-auto block text-center rounded-md border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-100 text-sm font-medium py-3 transition-colors"
            >
              Get started
            </a>
          </div>

          <div
            className="relative rounded-lg border bg-[#0a0a0a] p-7 md:p-8 flex flex-col"
            style={{ borderColor: accent, boxShadow: `0 0 0 1px ${accent}33, 0 20px 60px -20px ${accent}33` }}
          >
            <div
              className="absolute -top-3 left-7 text-[10px] tracking-[0.2em] font-semibold px-2.5 py-1 rounded"
              style={{ background: accent, color: '#0a0a0a' }}
            >
              MOST POPULAR
            </div>

            <div className="mb-6">
              <div className="text-sm font-medium mb-3" style={{ color: accent }}>
                Pro
              </div>
              <div className="relative h-[56px] md:h-[64px]">
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    annual ? 'opacity-0 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl text-neutral-100 tracking-tight font-medium">$19</span>
                    <span className="text-neutral-500 text-sm">/month</span>
                  </div>
                </div>
                <div
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    annual ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl text-neutral-100 tracking-tight font-medium">$190</span>
                    <span className="text-neutral-500 text-sm">/year</span>
                  </div>
                  <div className="text-neutral-500 text-xs mt-1">
                    $15.83/mo billed annually · <span style={{ color: accent }}>2 months free</span>
                  </div>
                </div>
              </div>
              <div className="text-neutral-500 text-sm mt-2">For founders shipping in public.</div>
            </div>

            <ul className="space-y-3 mb-8">
              <Feature>5 projects</Feature>
              <Feature>Unlimited leads</Feature>
              <Feature>Unlimited AI openers</Feature>
              <Feature>All 3 opener safety modes (Safe, Soft, Promo)</Feature>
              <Feature>Viral post templates</Feature>
              <Feature>Priority scanner runs</Feature>
              <Feature>Email support</Feature>
            </ul>

            <button
              onClick={() => alert('Checkout coming soon')}
              className="mt-auto block text-center rounded-md text-sm font-semibold py-3 transition-transform hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: accent, color: '#0a0a0a' }}
            >
              Upgrade to Pro
            </button>
          </div>
        </div>

        <p className="text-center text-neutral-500 text-sm mt-10">
          Today&apos;s signups are locked in at this price forever, even if we raise it later.
        </p>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer({ accent }: { accent: string }) {
  return (
    <footer className="relative bg-black pt-10 pb-10 px-6 border-t border-white/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${accent}, #c2421a 80%)`,
              }}
            />
            <div className="absolute inset-[5px] rounded-full bg-black/70" />
          </div>
          <span className="text-white font-semibold tracking-tight">Karmora</span>
          <span className="text-white/30 text-sm">— conversations, not campaigns.</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/40">
          <a className="hover:text-white transition">Privacy</a>
          <a className="hover:text-white transition">Terms</a>
          <a className="hover:text-white transition">hello@karmora.com</a>
          <span>© 2026</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- LandingPage (root) ---------- */
export default function LandingPage() {
  return (
    <div className="relative bg-black">
      <Hero accent={ACCENT} />
      <About accent={ACCENT} />
      <FeaturedBlock accent={ACCENT} />
      <Philosophy accent={ACCENT} />
      <Services accent={ACCENT} />
      <Pricing accent={ACCENT} />
      <Footer accent={ACCENT} />
    </div>
  );
}
