import React, { useEffect, useRef, useState } from "react";

/* ====== 외부에서 부를 함수 ====== */
export function startGame(difficulty = 1, onComplete = () => {}) {
  return <ColorSequenceGame difficulty={difficulty} onComplete={onComplete} />;
}

/* ====== 내부 컴포넌트 ====== */
export default function ColorSequenceGame({ difficulty = 1, onComplete }) {
  /* 난이도별 설정 */
  const gridSize = [4, 5, 6][difficulty] ?? 5;
  const seqLen   = [3, 5, 7][difficulty] ?? 5;

  const totalTiles = gridSize * gridSize;

  const [colors, setColors]         = useState([]);        // 타일 색상 배열
  const [sequence, setSequence]     = useState([]);        // 정답 인덱스 시퀀스
  const [showStep, setShowStep]     = useState(-1);        // 현재 깜빡이고 있는 단계
  const [inputStep, setInputStep]   = useState(0);         // 플레이어가 몇 번째를 입력 중인지
  const [acceptInput, setAcceptInput] = useState(false);   // 입력 가능 여부
  const [shake, setShake]           = useState(false);

  /* 최초 세팅 */
  useEffect(() => {
    // 랜덤 색 팔레트 만들기 (Hue만 다르게)
    const baseHue = Math.floor(Math.random() * 360);
    const newColors = Array.from({ length: totalTiles }, (_, i) => {
      const hue = (baseHue + (i * 137)) % 360;             // 골든앵글 값으로 분산
      return `hsl(${hue}, 70%, 55%)`;
    });
    setColors(newColors);

    // 정답 시퀀스 뽑기
    const idxArr = Array.from({ length: totalTiles }, (_, i) => i)
                         .sort(() => 0.5 - Math.random())
                         .slice(0, seqLen);
    setSequence(idxArr);
  }, [difficulty]);

  /* 시퀀스 재생 */
  const timeoutIds = useRef([]);
  useEffect(() => {
    if (sequence.length === 0) return;

    setAcceptInput(false);
    setShowStep(-1);
    setInputStep(0);

    // 800 ms 간격으로 깜빡이기
    sequence.forEach((idx, i) => {
      timeoutIds.current.push(setTimeout(() => setShowStep(i), 800 * i));
      timeoutIds.current.push(setTimeout(() => setShowStep(-1), 800 * i + 400));
    });
    // 시퀀스 끝난 뒤 입력 허용
    timeoutIds.current.push(setTimeout(() => setAcceptInput(true), 800 * sequence.length));

    return () => timeoutIds.current.forEach(clearTimeout);
  }, [sequence]);

  /* 타일 클릭 */
  const handleClick = (idx) => {
    if (!acceptInput) return;
    if (idx === sequence[inputStep]) {
      // 맞게 클릭
      if (inputStep + 1 === sequence.length) {
        onComplete();
      } else {
        setInputStep((p) => p + 1);
      }
    } else {
      // 틀림 – 다시 시퀀스 재생
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setInputStep(0);
      setAcceptInput(false);
      setShowStep(-1);
      // 잠깐 쉬고 다시 재생
      timeoutIds.current.push(setTimeout(() => {
        sequence.forEach((idx, i) => {
          timeoutIds.current.push(setTimeout(() => setShowStep(i), 800 * i));
          timeoutIds.current.push(setTimeout(() => setShowStep(-1), 800 * i + 400));
        });
        timeoutIds.current.push(setTimeout(() => setAcceptInput(true), 800 * sequence.length));
      }, 600));
    }
  };

  /* 렌더 */
  return (
    <div className={`w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-pink-100 ${shake ? "animate-shake" : ""}`}>
      <h2 className="text-3xl font-bold mb-4">순서 기억 게임</h2>

      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          width: "min(90vw, 420px)",
          aspectRatio: "1 / 1",
        }}
      >
        {colors.map((c, idx) => {
          const isActive   = showStep >= 0 && sequence[showStep] === idx;
          const isEntered  = idx === sequence[inputStep - 1];
          return (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              style={{
                background: c,
                opacity: isActive ? 0.35 : 1,
                transform: isEntered ? "scale(1.05)" : "scale(1)",
                transition: "all 0.2s",
              }}
              className="w-full h-full rounded"
            />
          );
        })}
      </div>

      <p className="mt-4 text-gray-700">
        {acceptInput ? "순서대로 눌러 보세요!" : "기억하세요…"}
      </p>

      {/* Shake 애니메이션 */}
      <style>{`
        @keyframes shake { 0%,100% {transform:translateX(0)} 25% {transform:translateX(-6px)} 75% {transform:translateX(6px)} }
        .animate-shake { animation: shake 0.4s ease }
      `}</style>
    </div>
  );
}
