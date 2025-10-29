import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import photo1 from "../images/1.jpg";
import photo2 from "../images/2.jpg";
import photo3 from "../images/3.jpg";
import photo4 from "../images/4.jpg";
import photo5 from "../images/5.png";
import photo6 from "../images/6.jpg";

// ------------------------------------------------------------
// Birthday Surprise – single-file React page (JSX version)
// - Door scene → click to enter
// - Cake scene → animals (photos) dance around cake; click to blow candles
//   -> auto go to Gifts scene; animals disappear
// - Gifts scene → wobble on hover; click opens modal with wish; after close
//   gift becomes opened and no longer wobbles
// - CakeAnimals now supports 6 user-provided image links (rounded-full,
//   fade in 2s → fade out 2s → jump to random spot, repeat)
// ------------------------------------------------------------

// --- Utilities ------------------------------------------------
const rand = (min, max) => Math.random() * (max - min) + min;
const range = (n) => Array.from({ length: n }, (_, i) => i);

// stage: 'door' | 'cake' | 'gifts'

// --- Reusable Effects ----------------------------------------
function useInterval(callback, delay) {
  const savedRef = useRef(callback);
  useEffect(() => {
    savedRef.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedRef.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// --- Balloons -------------------------------------------------
const Balloon = ({ left, delay, scale }) => {
  return (
    <div
      className="absolute bottom-[-20vh]"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        transform: `scale(${scale})`,
      }}
    >
      <div className="balloon" />
    </div>
  );
};

const Balloons = ({ count = 18 }) => {
  const balloons = useMemo(
    () =>
      range(count).map(() => ({
        left: rand(0, 100),
        delay: rand(0, 6),
        scale: rand(0.7, 1.4),
      })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {balloons.map((b, i) => (
        <Balloon key={i} {...b} />
      ))}
    </div>
  );
};

// --- Confetti -------------------------------------------------
const ConfettiPiece = () => {
  const left = rand(0, 100);
  const rotate = rand(0, 360);
  const delay = rand(0, 3);
  const size = rand(6, 12);
  return (
    <div
      className="confetti-piece"
      style={{
        left: `${left}%`,
        transform: `rotate(${rotate}deg)`,
        animationDelay: `${delay}s`,
        width: size,
        height: size,
      }}
    />
  );
};

const Confetti = ({ count = 120 }) => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {range(count).map((i) => (
      <ConfettiPiece key={i} />
    ))}
  </div>
);

// --- Firework bursts -----------------------------------------
const Firework = ({ x, y, delay = 0 }) => (
  <div
    className="absolute"
    style={{ left: x, top: y, animationDelay: `${delay}s` }}
  >
    <div className="firework" />
  </div>
);

const Fireworks = () => {
  const points = useMemo(
    () => [
      { x: "15%", y: "20%", d: 0 },
      { x: "75%", y: "18%", d: 0.8 },
      { x: "55%", y: "28%", d: 1.3 },
      { x: "30%", y: "15%", d: 2.1 },
    ],
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {points.map((p, i) => (
        <Firework key={i} x={p.x} y={p.y} delay={p.d} />
      ))}
    </div>
  );
};

// --- Animals around the cake ---------------------------------
// Constrain 6 photos to 6 distinct zones around the cake (no overlap with cake).
// Each photo fades in 2s → fades out 2s, then repositions randomly *within its zone*.
const CakeAnimals = ({ images = [] }) => {
  const COUNT = Math.min(images.length || 0, 6);
  const fallbacks = ["🐰", "🐱", "🐻", "🦊", "🐼", "🐨"]; // if no images yet
  const entries = COUNT ? images.slice(0, COUNT) : fallbacks;

  // Zone anchors (percentages) relative to the cake wrapper (the parent with position:relative).
  // Top-Left, Top-Right, Mid-Left, Mid-Right, Bottom-Left, Bottom-Right
  const ZONES = [
    { x: 85, y: 65 }, // TL
    { x: 17, y: 48 }, // TR
    { x: 15, y: 28 }, // ML
    { x: 80, y: 28 }, // MR
    { x: 20, y: 78 }, // BL
    { x: 75, y: 78 }, // BR
  ];

  // jitter box size (% of parent width/height)
  const JITTER = { x: 1, y: 1 };

  const [tick, setTick] = useState(0);
  const [spots, setSpots] = useState(() =>
    Array.from({ length: entries.length || 6 }, (_, i) => ({
      left: ZONES[i % 6].x + (Math.random() * 2 - 1) * JITTER.x,
      top: ZONES[i % 6].y + (Math.random() * 2 - 1) * JITTER.y,
    }))
  );

  useInterval(() => {
    setSpots(
      Array.from({ length: entries.length || 6 }, (_, i) => ({
        left: ZONES[i % 6].x + (Math.random() * 2 - 1) * JITTER.x,
        top: ZONES[i % 6].y + (Math.random() * 2 - 1) * JITTER.y,
      }))
    );
    setTick((t) => t + 1);
  }, 4000);

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {entries.map((entry, i) => (
        <motion.div
          key={`${tick}-${i}`}
          className="absolute"
          style={{
            left: `${spots[i]?.left ?? 0}%`,
            top: `${spots[i]?.top ?? 0}%`,
          }}
          // initial={{ opacity: 0, scale: 0.85 }}
          // animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 0.9] }}
          // transition={{
          //   duration: 4,
          //   times: [0, 0.25, 0.75, 1],
          //   repeat: Infinity,
          // }}
        >
          {COUNT ? (
            <img
              src={entry}
              alt="friend"
              className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full object-cover border-4 border-white/70 shadow-lg select-none"
              draggable={false}
            />
          ) : (
            <div className="text-4xl sm:text-5xl md:text-6xl select-none">
              {entry}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// --- Cake & Candles ------------------------------------------
const Candle = ({ lit }) => (
  <div className="relative mx-1 flex h-12 w-2 items-end rounded-sm bg-rose-300">
    <div className="h-3 w-full bg-rose-200" />
    <AnimatePresence>
      {lit && (
        <motion.div
          className="absolute -top-3 left-1/2 h-4 w-2 -translate-x-1/2 rounded-full flame"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: [0, -3, 0] }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
      )}
      {!lit && (
        <motion.div
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0], y: [-2, -12, -24] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        >
          💨
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Cake = ({ lit, onBlow }) => (
  <motion.button
    onClick={() => {
      if (lit) onBlow();
    }}
    className="relative z-10 mx-auto block rounded-2xl p-3 focus:outline-none"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    aria-label={lit ? "Blow out candles" : "Candles are out"}
  >
    <div className="mx-auto w-[220px] select-none">
      <div className="flex justify-center">
        {range(5).map((i) => (
          <Candle key={i} lit={lit} />
        ))}
      </div>
      <div className="h-20 rounded-t-2xl bg-rose-200 shadow-inner">
        <div className="icing" />
      </div>
      <div className="h-16 rounded-b-2xl bg-rose-300" />
      <div
        className="absolute inset-x-0 -bottom-6 m-auto w-40 rounded-full bg-black/5 blur-xl"
        style={{ height: 12 }}
      />
    </div>
    <div className="mt-3 text-center text-sm text-slate-700">
      {lit ? "Click để thổi nến và sang phần quà" : "Nến đã tắt ✨"}
    </div>
  </motion.button>
);

// --- Modal ----------------------------------------------------
const Modal = ({ open, message, onClose }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-[70] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div
          className="relative z-10 w-[90%] max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl"
          initial={{ scale: 0.9, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 10, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
        >
          <div className="text-xl font-semibold text-rose-600">
            Lời chúc dành cho bạn 🎀
          </div>
          <p className="mt-3 text-slate-700">{message}</p>
          <button
            onClick={onClose}
            className="mt-5 rounded-full bg-rose-500 px-4 py-2 text-white hover:bg-rose-600"
          >
            Đóng
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Gifts ----------------------------------------------------
const GIFT_MESSAGES = [
  "Chúc bạn tuổi mới luôn rực rỡ như pháo hoa và nhẹ nhàng như bóng bay 🎈",
  "Chúc mọi điều bạn ước đều gần hơn mỗi ngày ✨",
  "Luôn khoẻ, luôn vui và cười thật tươi nhé! 😊",
  "Thêm một tuổi – thêm nhiều hành trình đáng nhớ 💖",
  "Công việc thuận lợi, tình cảm ngọt ngào, túi lúc nào cũng đầy! 💼💗",
  "Đi đâu cũng gặp điều tốt lành và người dễ thương như bạn 🎁",
  "Nỗ lực hôm nay là phép màu của ngày mai – cố lên nhé! 🌟",
  "Chúc bạn luôn được yêu thương và yêu chính mình hơn 💝",
];

const Gifts = ({ openedIds, onOpenGift }) => {
  const gifts = useMemo(
    () =>
      GIFT_MESSAGES.map((m, i) => ({
        id: i,
        hue: Math.floor(rand(0, 360)),
        message: m,
      })),
    []
  );

  return (
    <div className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {gifts.map((g) => {
        const isOpened = openedIds.has(g.id);
        return (
          <motion.button
            key={g.id}
            onClick={() => onOpenGift(g.id, g.message)}
            className={`gift relative aspect-square w-full select-none rounded-2xl p-0 focus:outline-none ${
              isOpened ? "opened" : ""
            }`}
            style={{
              background: `linear-gradient(135deg, hsl(${g.hue} 70% 70%), hsl(${
                (g.hue + 40) % 360
              } 80% 60%))`,
            }}
            whileTap={{ scale: 0.98 }}
            aria-label={isOpened ? "Gift opened" : "Open gift"}
          >
            <motion.div
              className="absolute left-0 right-0 top-0 mx-auto h-10 w-[92%] rounded-t-2xl bg-white/70"
              animate={
                isOpened ? { rotateX: 60, y: -12 } : { rotateX: 0, y: 0 }
              }
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
              style={{ transformOrigin: "top center" }}
            />
            <div className="absolute inset-0 mx-auto w-4 bg-white/70" />
            <div className="absolute inset-x-0 top-1/2 mx-auto h-4 -translate-y-1/2 bg-white/70" />

            {!isOpened ? (
              <div className="absolute right-2 top-2 rounded-md bg-black/10 px-2 py-1 text-xs text-white shadow">
                Click
              </div>
            ) : (
              <div className="absolute right-2 top-2 rounded-md bg-emerald-600/90 px-2 py-1 text-xs text-white shadow">
                Đã mở
              </div>
            )}

            {isOpened && (
              <div className="absolute inset-0 flex items-center justify-center text-5xl">
                🎉
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

// --- Door Scene ----------------------------------------------
const DoorScene = ({ onEnter, opened }) => {
  return (
    <AnimatePresence>
      {!opened && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-sky-200 via-rose-100 to-amber-100"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative h-[70vh] w-[70vw] max-w-[560px] select-none">
            <motion.div
              className="absolute left-1/2 top-1/2 h-[70%] w-[46%] -translate-x-1/2 -translate-y-1/2 origin-left rounded-lg bg-rose-300 shadow-2xl"
              whileHover={{ scale: 1.01 }}
              style={{ perspective: 1200 }}
              onClick={onEnter}
            >
              <motion.div
                className="absolute inset-0 origin-left rounded-lg bg-gradient-to-br from-rose-200 to-rose-400"
                whileTap={{ rotateY: -25 }}
                transition={{ type: "spring", stiffness: 120, damping: 16 }}
              />
              <div className="absolute inset-0 p-4">
                <div className="h-full w-full rounded-md border-4 border-rose-500/40 bg-rose-200/40" />
              </div>
              <div className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-amber-300 shadow" />
            </motion.div>
            <div className="absolute inset-x-0 bottom-6 text-center">
              <div className="text-2xl font-semibold text-rose-600 drop-shadow">
                Click the door
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main Page (JSX) -----------------------------------------
export default function BirthdaySurprise() {
  const [stage, setStage] = useState("door");
  const [candlesLit, setCandlesLit] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [openedIds, setOpenedIds] = useState(new Set());

  // Provide up to 6 public image links (will show around cake)
  const [cakeImages] = useState([
    photo1,
    photo2,
    photo3,
    photo4,
    photo5,
    photo6,
  ]);

  // Ambient confetti toggle
  const [showConfetti, setShowConfetti] = useState(true);
  useInterval(() => setShowConfetti((s) => !s), 5000);

  const entered = stage !== "door";

  function handleEnter() {
    setStage("cake");
  }

  function handleBlowCandles() {
    setCandlesLit(false);
    setTimeout(() => setStage("gifts"), 600); // slight delay for feedback
  }

  function handleOpenGift(giftId, text) {
    setModalMsg(text);
    setModalOpen(true);
    window._pendingGiftId = giftId;
  }

  function handleCloseModal() {
    setModalOpen(false);
    const id = window._pendingGiftId;
    if (typeof id === "number") {
      setOpenedIds((prev) => new Set(prev).add(id));
      window._pendingGiftId = undefined;
    }
  }

  return (
    <div className="min-h-screen w-full overflow-hidden bg-gradient-to-b from-rose-50 via-amber-50 to-sky-50">
      {/* Door overlay */}
      <DoorScene opened={entered} onEnter={handleEnter} />

      {/* Ambient visuals */}
      <Balloons />
      {showConfetti && <Confetti />}
      <Fireworks />

      {/* Content */}
      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 pb-24 pt-14 sm:pt-20">
        <header className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-rose-600 sm:text-4xl md:text-5xl">
            Happy Birthday Tiger Anh Đào! 🎂💖
          </h1>
          {stage === "cake" && (
            <p className="mt-2 text-slate-600">Chạm để thổi nến nhé!</p>
          )}
          {stage === "gifts" && (
            <p className="mt-2 text-slate-600">
              Hãy mở một hộp quà để nhận điều bất ngờ ✨
            </p>
          )}
        </header>

        {/* Scene 2: Cake with surrounding animals (photos) */}
        {stage === "cake" && (
          <section className="relative rounded-3xl bg-white/70 p-6 shadow-xl backdrop-blur">
            <h2 className="mb-3 text-center text-lg font-semibold text-slate-700">
              Chiếc bánh sinh nhật
            </h2>
            <div className="relative mx-auto w-fit">
              <Cake lit={candlesLit} onBlow={handleBlowCandles} />
            </div>
          </section>
        )}

        {/* Scene 2: Cake with surrounding animals (photos) */}
        {stage === "cake" && (
          <section className="w-full h-full">
            <CakeAnimals images={cakeImages} />
          </section>
        )}

        {/* Scene 3: Gifts */}
        {stage === "gifts" && (
          <section className="w-full rounded-3xl bg-white/70 p-6 shadow-xl backdrop-blur">
            <h2 className="mb-4 text-center text-lg font-semibold text-slate-700">
              Quà tặng dành riêng cho bạn 🎁 – Click để mở
            </h2>
            <Gifts openedIds={openedIds} onOpenGift={handleOpenGift} />
          </section>
        )}
      </main>

      <Modal open={modalOpen} message={modalMsg} onClose={handleCloseModal} />

      {/* Footer */}
      <footer className="relative z-10 pb-10 text-center text-xs text-slate-500">
        Made with ❤ — Static single-file React (JSX).
      </footer>

      {/* Styles (Tailwind utility + a few custom CSS classes) */}
      <style>{`
        .balloon {
          width: 46px; height: 58px; border-radius: 50% 50% 45% 45%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.9), rgba(255,255,255,.1) 40%),
                      linear-gradient(160deg, #fda4af, #60a5fa, #f59e0b);
          animation: floatUp 9s linear infinite;
          position: relative;
          box-shadow: 0 10px 20px rgba(0,0,0,.08);
        }
        .balloon::after{
          content: ""; position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);
          width: 2px; height: 24px; background: rgba(0,0,0,.12);
        }
        @keyframes floatUp { from { transform: translateY(0); } to { transform: translateY(-120vh); } }

        .confetti-piece{
          position: absolute; top: -10vh; border-radius: 2px;
          background: linear-gradient(45deg, #f43f5e, #f59e0b, #22c55e, #3b82f6);
          animation: fall 5.6s linear infinite;
          opacity: .9;
        }
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: .9; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: .7; }
        }

        .firework{
          width: 4px; height: 4px; border-radius: 50%; background: white; box-shadow:
            0 -14px 0 2px #fb7185,
            14px 0 2px #f59e0b,
            0 14px 0 2px #22c55e,
            -14px 0 2px #3b82f6,
            10px -10px 0 2px #a78bfa,
            -10px -10px 0 2px #34d399,
            10px 10px 0 2px #f472b6,
            -10px 10px 0 2px #60a5fa;
          animation: burst 1.8s ease-in-out infinite;
          filter: drop-shadow(0 0 6px rgba(255,255,255,.8));
        }
        @keyframes burst { 0% { transform: scale(.2); opacity: 0 }
          20% { transform: scale(1); opacity: 1 }
          100% { transform: scale(.2); opacity: 0 } }

        .flame{
          background: radial-gradient(circle at 50% 30%, #fde68a, #fb923c 60%, #f43f5e 90%);
          filter: drop-shadow(0 0 6px rgba(251, 191, 36, .8));
        }
        .icing{ height: 16px; background: repeating-linear-gradient(90deg, #fff, #fff 12px, #fde68a 12px, #fde68a 20px); border-bottom-left-radius: 16px; border-bottom-right-radius: 16px; }

        /* Gift wobble on hover (only when not opened) */
        .gift:not(.opened):hover{ animation: wobble .8s ease-in-out infinite alternate; }
        @keyframes wobble { 0% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-3px) rotate(-2deg); } 100% { transform: translateY(0) rotate(2deg); } }
      `}</style>
    </div>
  );
}
