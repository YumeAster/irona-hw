// --------------------------------------------------------------
// GameDemoPage.js
// --------------------------------------------------------------
// Lists every mini‑game with buttons for difficulty 0 / 1 / 2.
// Clicking a button routes to:
//     /play?game=<id>&difficulty=<level>
// To register a new game, just add an entry to the `games` array —
// no other code changes needed.
// --------------------------------------------------------------

import React from "react";
import { useNavigate } from "react-router-dom";

// 🕹️ Register games here
const games = [
  { id: "arithmetic",       label: "Arithmetic Game" },
  { id: "colorPick",        label: "Color Pick Game" },
  { id: "colorSequence",    label: "Color Sequence Game" },
  { id: "fakeAlarm",        label: "Fake Alarm" },
  { id: "memory",           label: "Memory Game" },
  { id: "multiSwipe",       label: "Multi Swipe Game" },
  { id: "nested",           label: "Nested Game" },
  { id: "numberSequence",   label: "Number Sequence" },
  { id: "sentence",         label: "Sentence Game" },
  { id: "slipAway",         label: "Slip Away" },
  { id: "tap",              label: "Tap Game" },
  { id: "typingPractice",   label: "Typing Practice" },
  { id: "weatherGuess",     label: "Weather Guess" },
];

export default function GameDemoPage() {
  const navigate = useNavigate();

  const go = (id, level) => {
    if (id === "fakeAlarm") {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");

      const fakeAlarm = {
        id: Date.now(),
        category: "quick",
        title: "테스트용 알람",
        time: `${hh}:${mm}`,
        enabled: true,
        isRepeatMode: false,
        repeatRules: [],
        selectedWeekdays: [],
      };

      navigate(`/play?game=${id}&difficulty=${level}`, {
        state: { alarm: fakeAlarm },
      });
    } else {
      navigate(`/play?game=${id}&difficulty=${level}`);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">🎮 Game Demo</h1>

      <table className="w-full border-collapse text-center">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2">Game</th>
            {[0, 1, 2].map((lvl) => (
              <th key={lvl} className="p-2">
                {lvl}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {games.map((g) => (
            <tr key={g.id} className="border-t hover:bg-gray-50">
              <td className="text-left p-2 font-medium">{g.label}</td>
              {[0, 1, 2].map((lvl) => (
                <td key={lvl} className="p-2">
                  <button
                    className="rounded px-3 py-1 bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition"
                    onClick={() => go(g.id, lvl)}
                  >
                    Lv {lvl}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}