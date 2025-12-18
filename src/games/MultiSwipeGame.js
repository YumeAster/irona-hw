import React, { useState, useMemo } from "react";

export default function MultiSwipeGame({ difficulty = 1, onComplete }) {
  const [startY, setStartY] = useState(null);
  const [swipeCount, setSwipeCount] = useState(0);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);

  const requiredSwipes = useMemo(() => {
    if (difficulty === 0) return Math.floor(Math.random() * 3) + 3; // 3~5
    if (difficulty === 1) return Math.floor(Math.random() * 4) + 5; // 5~8
    if (difficulty === 2) return Math.floor(Math.random() * 3) + 8; // 8~10
    return 10;
  }, [difficulty]);

  const onSwipeDetected = () => {
    setSwipeCount((prev) => {
      const next = prev + 1;
      if (next >= requiredSwipes) {
        onComplete();
      }
      return next;
    });

    setShake(true);
    setTimeout(() => setShake(false), 300);

    setFlash(true);
    setTimeout(() => setFlash(false), 100);
  };

  const handleMouseDown = (e) => setStartY(e.clientY);
  const handleMouseMove = (e) => {
    if (startY == null) return;
    const delta = startY - e.clientY;
    if (delta > 100) {
      setStartY(null);
      onSwipeDetected();
    }
  };
  const handleMouseUp = () => setStartY(null);

  const handleTouchStart = (e) => setStartY(e.touches[0].clientY);
  const handleTouchMove = (e) => {
    if (startY == null) return;
    const delta = startY - e.touches[0].clientY;
    if (delta > 100) {
      setStartY(null);
      onSwipeDetected();
    }
  };
  const handleTouchEnd = () => setStartY(null);

  const interpolateColor = (count, max) => {
    const ratio = Math.min(count / max, 1);
    const r = Math.round(255 * (1 - ratio));
    const g = 0;
    const b = Math.round(255 * ratio);
    return `rgb(${r},${g},${b})`;
  };

  const currentColor = interpolateColor(swipeCount, requiredSwipes);

  return (
    <div className={`relative min-h-screen w-screen flex flex-col items-center justify-between text-center px-6 py-10 bg-gradient-to-b from-blue-100 to-pink-100 overflow-hidden ${shake ? "shake" : ""}`}>      
      {flash && <div className="fixed top-0 left-0 w-full h-full bg-white opacity-80 z-50 flash" />}

      <div className="text-4xl font-bold text-gray-800 mt-4">알람</div>
      <div className="mt-2">
        <p className="text-lg text-gray-700 font-semibold">스와이프 해제 게임</p>
      </div>
      <div>
        <p className="text-5xl font-black text-gray-900 mb-4 whitespace-pre-line">
          우리 친구<br />일어나야지
        </p>
      </div>
      <div className="mb-8">
        <div
          className="relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-32 h-32 rounded-full animate-ping absolute" style={{ backgroundColor: currentColor, opacity: 0.5 }} />
          <button
            className="w-32 h-32 rounded-full text-white text-2xl font-bold relative"
            style={{ backgroundColor: currentColor }}
          >
            네
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }
        .shake {
          animation: shake 0.3s ease;
        }
        .flash {
          animation: flashOut 0.1s ease-out forwards;
        }
        @keyframes flashOut {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
