import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const initialGames = ['a', 'b', 'c', 'd', 'e', 'f'];
const STORAGE_KEY = 'blacklist_games';

export default function BlacklistPage() {
  const navigate = useNavigate();
  const [blacklist, setBlacklist] = useState({});

  // 🔹 처음 진입 시 localStorage에서 불러오기
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setBlacklist(JSON.parse(stored));
    } else {
      // 처음이면 false로 초기화
      const initialState = Object.fromEntries(initialGames.map((game) => [game, false]));
      setBlacklist(initialState);
    }
  }, []);

  // 🔹 상태가 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    if (Object.keys(blacklist).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blacklist));
    }
  }, [blacklist]);

  const toggleGame = (game) => {
    const updated = { ...blacklist, [game]: !blacklist[game] };
    setBlacklist(updated);
    alert(`게임 "${game}"은 ${updated[game] ? '블랙리스트에 추가됨' : '블랙리스트에서 제거됨'}`);
  };

  return (
    <div className="p-6">
      <button
        className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        onClick={() => navigate(-1)}
      >
        ← 뒤로가기
      </button>

      <h1 className="text-2xl font-bold mb-6">블랙리스트 설정</h1>

      <div className="space-y-4">
        {initialGames.map((game) => (
          <div
            key={game}
            className="flex justify-between items-center px-4 py-3 bg-gray-100 rounded"
          >
            <span className="text-lg font-medium">게임 {game.toUpperCase()}</span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox" 
                checked={blacklist[game] || false}
                onChange={() => toggleGame(game)}
                className="sr-only"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full relative transition">
                <div
                  className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition ${
                    blacklist[game] ? 'translate-x-5 bg-green-400' : ''
                  }`}
                />
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
