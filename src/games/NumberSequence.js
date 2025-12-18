import React, { useEffect, useState } from "react";

export default function NumberSequenceGame({ difficulty, onComplete }) {
  const gridSize = [3, 4, 5][difficulty] || 3;
  const totalNumbers = gridSize * gridSize;

  const [numbers, setNumbers] = useState([]);
  const [nextExpected, setNextExpected] = useState(1);
  const [disabledButtons, setDisabledButtons] = useState(new Set());

  useEffect(() => {
    const shuffled = [...Array(totalNumbers).keys()].map(n => n + 1);
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setNumbers(shuffled);
    setNextExpected(1);
    setDisabledButtons(new Set());
  }, [difficulty]);

  const handleClick = (num) => {
    if (num === nextExpected) {
      const newDisabled = new Set(disabledButtons);
      newDisabled.add(num);
      setDisabledButtons(newDisabled);
      if (num === totalNumbers) {
        onComplete();
      } else {
        setNextExpected(num + 1);
      }
    } else {
      // Reset game
      setNextExpected(1);
      setDisabledButtons(new Set());
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg text-center">
      <h2 className="text-xl font-bold mb-4">숫자를 순서대로 눌러 알람을 해제하세요!</h2>
      <div
        className="grid gap-2 justify-center"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 60px))`,
          display: "grid",
        }}
      >
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => handleClick(num)}
            disabled={disabledButtons.has(num)}
            className={`w-[60px] h-[60px] rounded-lg font-bold text-lg border border-gray-300 ${
              disabledButtons.has(num)
                ? "bg-gray-300 text-white"
                : "bg-blue-100 hover:bg-blue-300"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}
