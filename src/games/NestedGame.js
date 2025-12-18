import React, { useState, useEffect, useRef } from "react";

export default function NestedGame({ difficulty = 1, onComplete }) {
  const ALARM_INTERVAL = [7000, 4000, 3000][difficulty];
  const MAX_ALARMS = [3, 5, 7][difficulty];

  const [alarms, setAlarms] = useState([]);
  const [timeLeft, setTimeLeft] = useState(ALARM_INTERVAL / 1000);
  const [gameState, setGameState] = useState("waiting"); // waiting, playing, success
  const alarmId = useRef(1);
  const audioRefs = useRef({});

  // mount 시 자동 시작
  useEffect(() => {
    handleStart();
  }, []);

  // 타이머 (알람 추가용)
  useEffect(() => {
    if (gameState !== "playing") return;
    if (alarms.length >= MAX_ALARMS) return;
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState, alarms.length]);

  // 알람 추가
  useEffect(() => {
    if (gameState !== "playing") return;
    if (alarms.length >= MAX_ALARMS) return;
    if (timeLeft <= 0) {
      addAlarm();
      setTimeLeft(ALARM_INTERVAL / 1000);
    }
  }, [timeLeft, alarms.length, gameState]);

  // 게임 상태에 따라 오디오 멈춤
  useEffect(() => {
    if (gameState === "success" || gameState === "waiting") {
      stopAllAudios();
    }
  }, [gameState]);

  useEffect(() => {
    return () => stopAllAudios();
  }, []);

  const addAlarm = () => {
    const newId = alarmId.current++;
    setAlarms(prev => [...prev, { id: newId }]);
    setTimeout(() => {
      if (audioRefs.current[newId]) {
        audioRefs.current[newId].currentTime = 0;
        audioRefs.current[newId].play();
      }
    }, 200);
  };

  const handleStart = () => {
    alarmId.current = 1;
    setAlarms([{ id: 1 }]);
    setTimeLeft(ALARM_INTERVAL / 1000);
    setGameState("playing");
    setTimeout(() => {
      if (audioRefs.current[1]) {
        audioRefs.current[1].currentTime = 0;
        audioRefs.current[1].play();
      }
    }, 200);
  };

  const handleRestart = () => {
    stopAllAudios();
    setAlarms([]);
    setTimeLeft(ALARM_INTERVAL / 1000);
    setGameState("waiting");
    alarmId.current = 1;
  };

  const stopAllAudios = () => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  };

  const handleClearAlarm = (id) => {
    if (alarms.length === 0) return;
    const lastIndex = alarms.length - 1;
    if (alarms[lastIndex].id !== id) return;
    setGameState("success");
    stopAllAudios();
    onComplete?.(); // 콜백 호출
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      {gameState === "playing" && (
        <div>
    {alarms.length < MAX_ALARMS && (
      <div style={{ marginBottom: "1rem" }}>
        <b>남은 시간(다음 알람 추가까지): </b>
        <span style={{ fontSize: "1.3rem", color: "#d7263d" }}>{timeLeft}s</span>
      </div>
    )}
          <AlarmList
            alarms={alarms}
            handleClearAlarm={handleClearAlarm}
            audioRefs={audioRefs}
            soundSrc="/alarmTest.mp3"
            gameState={gameState}
          />
        </div>
      )}
    </div>
  );
}

// 알람 리스트 컴포넌트
function AlarmList({ alarms, handleClearAlarm, audioRefs, soundSrc, gameState }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      gap: "1rem",
      marginBottom: "1rem",
      flexWrap: "wrap"
    }}>
      {alarms.map((alarm, idx) => (
        <div key={alarm.id}
             style={{
               background: "#fffbe6",
               border: "2px solid #ffa600",
               borderRadius: 16,
               padding: 24,
               minWidth: 140,
               minHeight: 120,
               position: "relative",
               boxShadow: "0 0 18px #ffe06677",
               display: "flex",
               flexDirection: "column",
               alignItems: "center"
             }}>
          <div style={{ height: 10, marginBottom: 10 }} />
          <div style={{ marginBottom: 16 }}>
            <span role="img" aria-label="ring">🔔</span> 울리는 중!
          </div>
          <audio
            ref={el => { if (el) audioRefs.current[alarm.id] = el; }}
            src={soundSrc}
            loop
            preload="auto"
            autoPlay
          />
          {idx === alarms.length - 1 && gameState === "playing" && (
            <button
              onClick={() => handleClearAlarm(alarm.id)}
              style={{
                background: "#d7263d",
                color: "#fff",
                fontWeight: "bold",
                border: "none",
                borderRadius: 8,
                padding: "8px 18px",
                fontSize: "1rem",
                cursor: "pointer"
              }}>
              해제
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
