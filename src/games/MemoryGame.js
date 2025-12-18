import React, { useEffect, useState } from "react";

const COLORS = [
  { key: "R", color: "bg-red-500" },
  { key: "Y", color: "bg-yellow-400" },
  { key: "G", color: "bg-green-500" },
  { key: "B", color: "bg-blue-500" },
];

export default function MemoryGame({ difficulty = 0, onComplete }) {
  const targetSuccess = [3, 5, 7][difficulty];

  const [sequence, setSequence] = useState([]);       // 현재까지의 정답 시퀀스
  const [userInput, setUserInput] = useState([]);     // 유저가 입력 중인 시퀀스
  const [isDisplaying, setIsDisplaying] = useState(false); // 시퀀스 점멸 중 여부
  const [highlightKey, setHighlightKey] = useState(null);  // 현재 점멸 중인 키
  const [successCount, setSuccessCount] = useState(0);
  const [resetKey, setResetKey] = useState(0);        // 리렌더 강제 트리거

  // 새로운 시퀀스 추가 + 점멸
  const startNewRound = () => {
    const next = COLORS[Math.floor(Math.random() * 4)].key;
    const newSeq = [...sequence, next];
    setSequence(newSeq);
    setUserInput([]);
    flashSequence(newSeq);
  };

  // 점멸 함수
  const flashSequence = async (seq) => {
    setIsDisplaying(true);
    for (let i = 0; i < seq.length; i++) {
      setHighlightKey(seq[i]);
      await new Promise((res) => setTimeout(res, 500));
      setHighlightKey(null);
      await new Promise((res) => setTimeout(res, 200));
    }
    setIsDisplaying(false);
  };

  // 유저 입력 처리
  const handleClick = (key) => {
    if (isDisplaying) return;
    const idx = userInput.length;
    if (sequence[idx] === key) {
      const newInput = [...userInput, key];
      setUserInput(newInput);
      if (newInput.length === sequence.length) {
        const nextSuccess = successCount + 1;
        setSuccessCount(nextSuccess);
        if (nextSuccess >= targetSuccess) {
          onComplete();
        } else {
          setTimeout(startNewRound, 800);
        }
      }
    } else {
      // 실패 - 전체 점멸 + 초기화
      setHighlightKey("ALL");
      setTimeout(() => {
        setHighlightKey(null);
        setSequence([]);
        setUserInput([]);
        setSuccessCount(0);
        setResetKey((k) => k + 1);
      }, 1000);
    }
  };

  // 첫 시작 또는 초기화 후 1회차 시작
  useEffect(() => {
    setTimeout(startNewRound, 600);
  }, [resetKey]);

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-xl font-bold mb-4">기억력 게임</h2>
      <p className="mb-2 text-gray-700">성공: {successCount} / {targetSuccess}</p>
      <div className="grid grid-cols-2 gap-4 mt-6">
        {COLORS.map(({ key, color }) => (
          <button
            key={key}
            onClick={() => handleClick(key)}
            className={`w-24 h-24 rounded-xl transition-all duration-150
              ${highlightKey === key || highlightKey === "ALL" ? `${color} brightness-125` : `${color} brightness-75`}`}
            disabled={isDisplaying}
          />
        ))}
      </div>
      <p className="mt-6 text-sm text-gray-500">불빛 순서를 기억해서 따라 눌러보세요.</p>
    </div>
  );
}
