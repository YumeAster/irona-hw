import React, { useState, useRef, useEffect, useMemo } from "react";

const TapGame = ({ difficulty = 1, onComplete, onCnt }) => {
  const TIME_LIMIT = useMemo(() => [3, 5, 7][difficulty], [difficulty]);
  const TARGET_COUNT = useMemo(() => [15, 30, 60][difficulty], [difficulty]);

  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [gameState, setGameState] = useState("ready");
  const timerRef = useRef(null);

  // 게임 자동 시작 (최초 mount 한 번만 실행)
  useEffect(() => {
    startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startGame = () => {
    clearInterval(timerRef.current);
    setCount(0);
    countRef.current = 0;
    setTimeLeft(TIME_LIMIT);
    setGameState("playing");

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          const didSucceed = countRef.current >= TARGET_COUNT;
          setGameState(didSucceed ? "success" : "fail");

          if (didSucceed && onComplete) onComplete();

          if (!didSucceed) {
            setTimeout(() => {
              resetGame();
            }, 1500);
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTap = () => {
    if (gameState !== "playing") return;
    setCount(prev => {
      const newCount = prev + 1;
      countRef.current = newCount;
      if (onCnt) onCnt(newCount);

      if (newCount >= TARGET_COUNT) {
        clearInterval(timerRef.current);
        setGameState("success");
        if (onComplete) onComplete();
      }

      return newCount;
    });
  };

  const resetGame = () => {
    clearInterval(timerRef.current);
    setCount(0);
    countRef.current = 0;
    setTimeLeft(TIME_LIMIT);
    setGameState("ready");

    // 자동으로 다시 시작
    setTimeout(() => {
      startGame();
    }, 100);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <p>
        제한 시간: {TIME_LIMIT}초<br />
        목표: {TARGET_COUNT}번 클릭
      </p>
      <div style={{ fontSize: "2rem", margin: "1rem" }}>
        남은 시간: {timeLeft}s
      </div>
      <div style={{ fontSize: "2rem", margin: "1rem" }}>
        클릭 수: {count}
      </div>

      {gameState === "playing" && (
        <button
          onClick={handleTap}
          style={{
            fontSize: "2rem",
            padding: "2rem",
            background: "#f7b731",
            borderRadius: "1rem",
            border: "none"
          }}
        >
          연타!
        </button>
      )}

      {gameState === "success" && (
        <div>
          <div style={{ color: "green", fontWeight: "bold", fontSize: "1.5rem" }}>성공!</div>
          <button onClick={startGame}>다시하기</button>
        </div>
      )}

      {gameState === "fail" && (
        <div>
          <div style={{ color: "red", fontWeight: "bold", fontSize: "1.5rem" }}>실패!</div>
          <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>
            잠시 후 자동으로 다시 시작됩니다...
          </div>
        </div>
      )}
    </div>
  );
};

export default TapGame;
