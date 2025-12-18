import React, { useEffect, useState } from "react";

/* 외부에서 호출할 래퍼
   └ 예) root.render(startGame(2, () => stopAlarm())); */
export function startGame(difficulty = 1, onComplete = () => {}) {
  return <TypingPracticeGame difficulty={difficulty} onComplete={onComplete} />;
}

/* ────────────────────────────────────────────────────────── */

export default function TypingPracticeGame({ difficulty = 1, onComplete }) {
  /* 난이도별 ‘단어 세트 풀(pool)’ */
  const wordPool = {
    0: [
      ["red", "green", "blue"],
      ["black", "white", "yellow"],
      ["orange", "purple", "pink"],
      ["sun", "moon", "star"],
    ],
    1: [
      ["computer", "science", "react", "javascript"],
      ["internet", "database", "frontend", "backend"],
      ["variable", "function", "component", "context"],
      ["algorithm", "analysis", "optimize", "complexity"],
    ],
    // 3단계는 무작위 알파벳 20자
  };

  const [target, setTarget] = useState(null);   // 목표 문장 (null = 준비 중)
  const [typed, setTyped]   = useState("");     // 사용자가 입력한 내용

  /* ───── 목표 문장 생성 ───── */
  useEffect(() => {
    if (difficulty === 2) {
      /* 무작위 알파벳 20자 */
      const letters = "abcdefghijklmnopqrstuvwxyz";
      let str = "";
      for (let i = 0; i < 20; i++) {
        str += letters[Math.floor(Math.random() * letters.length)];
      }
      setTarget(str);
    } else {
      /* 단어 세트 풀에서 랜덤 선택 → 공백으로 합쳐 target */
      const sets = wordPool[difficulty];
      const chosen = sets[Math.floor(Math.random() * sets.length)];
      setTarget(chosen.join(" "));
    }
    setTyped("");   // 새 문제 시작 → 입력 초기화
  }, [difficulty]);

  /* ───── 완료 체크 ───── */
  useEffect(() => {
    if (target && typed === target) {
      onComplete();
    }
  }, [typed, target]);

  /* ───── 렌더 ───── */
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-pink-100 px-6">
      <h2 className="text-3xl font-bold mb-6">타자 연습</h2>

      {/* 목표 문장 */}
      <div className="text-xl font-mono bg-white/70 px-4 py-3 rounded-lg mb-4 select-none min-h-[3rem] whitespace-pre-wrap text-center">
        {target ?? "문장 준비 중…"}
      </div>

      {/* 입력창 */}
      <textarea
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        rows={3}
        className="w-full max-w-lg p-3 rounded border border-gray-300 text-lg resize-none focus:outline-none focus:ring"
        placeholder="여기에 타이핑하세요"
        autoFocus
        disabled={!target}
      />

      {/* 진행 상황 / 완료 메시지 */}
      <p className="mt-4 text-gray-700">
        {target
          ? (typed === target ? "잘했어요! ✅" : `${typed.length}/${target.length} 글자`)
          : "문장 준비 중…"}
      </p>
    </div>
  );
}
