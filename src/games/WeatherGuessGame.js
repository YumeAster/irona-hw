import React, { useRef, useState, useEffect } from "react";
import { WiDaySunny, WiCloud, WiRain, WiSnow, WiThunderstorm, WiFog, WiNightAltRainMix, WiDayShowers } from "react-icons/wi";

const allWeatherOptions = [
  { id: "Clear", icon: <WiDaySunny size={64} />, label: "맑음" },
  { id: "Clouds", icon: <WiCloud size={64} />, label: "흐림" },
  { id: "Rain", icon: <WiRain size={64} />, label: "비" },
  { id: "Snow", icon: <WiSnow size={64} />, label: "눈" },
  { id: "Thunderstorm", icon: <WiThunderstorm size={64} />, label: "천둥번개" },
  { id: "Fog", icon: <WiFog size={64} />, label: "안개" },
  { id: "Drizzle", icon: <WiDayShowers size={64} />, label: "이슬비" },
  { id: "Sleet", icon: <WiNightAltRainMix size={64} />, label: "진눈깨비" },
];

export default function WeatherGuessGame({ difficulty = 1, onComplete }) {
  const [weatherOptions, setWeatherOptions] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  
  useEffect(() => {
    const optionsCount = [3, 5, 8][difficulty] || 5;
    const shuffled = [...allWeatherOptions].sort(() => 0.5 - Math.random());
    const selectedOptions = shuffled.slice(0, optionsCount);
    setWeatherOptions(selectedOptions);
    const randomWeather = selectedOptions[Math.floor(Math.random() * selectedOptions.length)].id;
    setAnswer(randomWeather);
  }, [difficulty]);

  const handleGuess = (guessId) => {
    setSelected(guessId);
    const correct = guessId === answer;
    setFeedback(correct ? "정답입니다!" : "틀렸어요! 다시 시도해보세요.");
    if (correct && onComplete) onComplete();
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-100 to-pink-100">
      <h1 className="text-4xl font-bold mb-6">오늘의 날씨는?</h1>
      <div className="flex flex-wrap justify-center gap-6 mb-6 max-w-3xl">
        {weatherOptions.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => handleGuess(id)}
            className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition transform hover:scale-110 
              ${selected === id ? (id === answer ? 'border-green-500' : 'border-red-500') : 'border-transparent'}`}
          >
            {icon}
            <span className="mt-2 text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
      <div className="text-lg font-semibold text-gray-800">{feedback}</div>
    </div>
  );
}
