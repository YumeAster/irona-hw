import React, { useRef, useState, useEffect } from "react";

export default function SlipAwayGame({ difficulty = 1, onComplete }) {
  const buttonRef = useRef(null);
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ top: "50%", left: "50%" });
  const [transitioning, setTransitioning] = useState(false);
  const [startTouch, setStartTouch] = useState(null);
  const [touchPath, setTouchPath] = useState([]);

  const interval = [500, 400, 300][difficulty];
  const distanceScale = [0.75, 1, 1.5][difficulty]

  useEffect(() => {
    const moveInterval = setInterval(() => {
      const container = containerRef.current;
      const btn = buttonRef.current;
      if (!container || !btn) return;

      const maxX = (container.offsetWidth - btn.offsetWidth) * distanceScale;
      const maxY = (container.offsetHeight - btn.offsetHeight) * distanceScale;

      const offsetX = (container.offsetWidth - btn.offsetWidth) * (1 - distanceScale) / 2;
      const offsetY = (container.offsetHeight - btn.offsetHeight) * (1 - distanceScale) / 2;

      const newX = offsetX + Math.random() * maxX;
      const newY = offsetY + Math.random() * maxY;

      setTransitioning(true);
      setPosition({ top: `${newY}px`, left: `${newX}px` });

      setTimeout(() => setTransitioning(false), 300);
    }, interval);

    return () => clearInterval(moveInterval);
  }, [difficulty]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();

    const relativeX = (touch.clientX - rect.left) / rect.width;
    const relativeY = (touch.clientY - rect.top) / rect.height;

    setStartTouch({ x: relativeX, y: relativeY });
    setTouchPath([{ x: relativeX, y: relativeY }]);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();

    const relativeX = (touch.clientX - rect.left) / rect.width;
    const relativeY = (touch.clientY - rect.top) / rect.height;

    setTouchPath((prev) => [...prev, { x: relativeX, y: relativeY }]);
  };

  const handleTouchEnd = () => {
    if (!startTouch || touchPath.length < 2) return;

    const withinButton = (pt) => pt.x >= 0.25 && pt.x <= 0.75 && pt.y >= 0.25 && pt.y <= 0.75;
    const passedThroughButton = touchPath.some(withinButton);

    if (withinButton(startTouch) && passedThroughButton) {
      onComplete();
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-blue-100 to-pink-100 flex flex-col items-center justify-between px-6 py-10"
    >
      <div className="text-4xl font-bold text-gray-800 mt-4">알람</div>

      <div className="mt-2">
        <p className="text-lg text-gray-700 font-semibold"></p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <p className="text-5xl font-black text-gray-900 mb-4 whitespace-pre-line text-center">
          우리 친구<br />일어나야지
        </p>
      </div>

      <div
        className={`absolute w-32 h-32 transition-all duration-300 ease-in-out ${transitioning ? 'transform scale-105' : ''}`}
        style={{ top: position.top, left: position.left }}
      >
        <div className="w-32 h-32 rounded-full bg-blue-300 animate-ping absolute" />
        <button
          ref={buttonRef}
          className="w-32 h-32 rounded-full bg-blue-500 text-white text-2xl font-bold flex items-center justify-center relative"
        >
          네
        </button>
      </div>

      <div className="flex flex-col items-center text-gray-800 text-sm px-4 gap-4 mb-4">
        <p className="text-base">중앙을 스와이프하여 해제</p>
      </div>
    </div>
  );
}
