import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import NumberSequenceGame from "../games/NumberSequence";
import ArithmeticGame from "../games/ArithmeticGame";
import ColorPickGame from "../games/ColorPickGame";
import ColorSequenceGame from "../games/ColorSequenceGame";
import FakeAlarm from "../games/FakeAlarm";
import MemoryGame from "../games/MemoryGame";
import MultiSwipeGame from "../games/MultiSwipeGame";
import NestedGame from "../games/NestedGame";
import SentenceGame from "../games/SentenceGame";
import SlipAwayGame from "../games/SlipAwayGame";
import TapGame from "../games/TapGame";
import TypingPracticeGame from "../games/TypingPracticeGame";
import WeatherGuessGame from "../games/WeatherGuessGame";
import SequenceGame from "../games/SequenceGame";

const GAMES = [
  ArithmeticGame,
  SequenceGame,
]; // 사용할 게임들 목록

const GameDifficulty = 1;// 난이도는 상수 or 추후 동적으로 설정 가능

export default function GameAlarmHandler() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const audioRef = useRef(null);
  const [SelectedGame, setSelectedGame] = useState(null);
  const alarm = location.state?.alarm;

  useEffect(() => {
    // 게임 랜덤 선택
    const randomIndex = Math.floor(Math.random() * GAMES.length);
    setSelectedGame(() => GAMES[randomIndex]);
    const audio = new Audio("/alarmTest.mp3");

    if(randomIndex != 6){
      audio.loop = true;
      audio.play().catch((e) => console.warn("🔇 소리 실패", e));
      audioRef.current = audio;
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const handleComplete = () => {
    alarm.enabled = false;
    navigate("/HomePage", { state: { alarm: alarm } });
  };

  if (!SelectedGame) return <div>게임을 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 flex justify-center items-center">
      <SelectedGame difficulty={GameDifficulty} onComplete={handleComplete} />
    </div>
  );
}
