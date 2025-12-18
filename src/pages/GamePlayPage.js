// --------------------------------------------------------------
// GamePlayPage.js
// --------------------------------------------------------------
// /play?game=<id>&difficulty=<level>
// --------------------------------------------------------------
import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ----- 각 게임 컴포넌트 -----
import ArithmeticGame       from "../games/ArithmeticGame";
import ColorPickGame        from "../games/ColorPickGame";
import ColorSequenceGame    from "../games/ColorSequenceGame";
import FakeAlarm            from "../games/FakeAlarm";
import MemoryGame           from "../games/MemoryGame";
import MultiSwipeGame       from "../games/MultiSwipeGame";
import NestedGame           from "../games/NestedGame";
import NumberSequenceGame   from "../games/NumberSequence";
import SentenceGame         from "../games/SentenceGame";
import SlipAwayGame         from "../games/SlipAwayGame";
import TapGame              from "../games/TapGame";
import TypingPracticeGame   from "../games/TypingPracticeGame";
import WeatherGuessGame     from "../games/WeatherGuessGame";
import SequenceGame         from "../games/SequenceGame";

const GAME_MAP = {
  arithmetic:       ArithmeticGame,
  sequence:         SequenceGame,
};

export default function GamePlayPage() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const qs        = new URLSearchParams(location.search);
  const gameKey   = qs.get("game");
  const raw = qs.get("difficulty");
  const level = raw !== null ? Number(raw) : 1;

  const SelectedGame = useMemo(() => GAME_MAP[gameKey], [gameKey]);

  if (!SelectedGame) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        ❌ Unknown game id: <code className="mx-1">{gameKey}</code>
      </div>
    );
  }

  const handleComplete = () => navigate(-1); // 게임 끝 → 이전 페이지로

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-rose-100 to-indigo-100">
      <SelectedGame difficulty={level} onComplete={handleComplete} />
    </div>
  );
}
