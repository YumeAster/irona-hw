import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBluetooth } from "../utils/useBluetooth";

export default function AlarmRingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const alarm = location.state?.alarm;
  const [snoozeMin, setSnoozeMin] = useState(5);
  const [startX, setStartX] = useState(null);
  const [startY, setStartY] = useState(null);

  const audioRef = useRef(null);

  const { isConnected, sendData, latestData } = useBluetooth();

  useEffect(() => {
    if (!alarm) {
      navigate("/");
      return;
    }

    const audio = new Audio("/alarmTest.mp3");
    audio.loop = true;
    audio.play().catch((e) => console.warn("🔇 소리 실패", e));
    audioRef.current = audio;

    if (isConnected) {
      sendData("VIB:1").catch((e) => console.warn("진동 명령 전송 실패", e));
      sendData("IMG:배경 이미지.bmp,0,0").catch((e) => console.warn("이미지 전송 실패", e));
    } else {
      console.log("블루투스 미연결로 진동 명령 미전송");
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [alarm, navigate]);

  const handleDismiss = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    alarm.enabled = false;
    navigate("/HomePage", { state: { alarm: alarm } });
  };

  useEffect(() => {
    if (!latestData) return;

    let latestDataList = latestData.split(",");

    if(latestDataList[6] === "1") {
      console.log("알람 정지");
      handleDismiss();
    }
  }, [latestData, handleDismiss]);

  const handleSnooze = () => {
    alert(`${snoozeMin}분 뒤에 다시 울릴게요!`);

    alarm.enabled = false;

    let alarmNum = alarm.time.split(":");
    let alarmHour = parseInt(alarmNum[0]);
    let alarmMinute = parseInt(alarmNum[1]);

    alarmMinute += snoozeMin;

    if(alarmMinute >= 60) {
      alarmHour += Math.floor(alarmMinute / 60)
      alarmMinute %= 60;
    }

    const alarmData = {
      id: Date.now(),
      category: "quick",
      title: `${snoozeMin}분 후 울리는 알람`,
      time: `${alarmHour}:${alarmMinute}`,
      useRepeat: alarm.isRepeatMode,
      enabled: true,
      repeatRules: alarm.repeatRules,
      weekdays: alarm.selectedWeekdays,
    };

    navigate("/HomePage", { state: { alarms: [alarm, alarmData] } });
  };

  const handleMouseDown = (e) => {
    setStartX(e.clientX);
    setStartY(e.clientY);
  }
  const handleMouseMove = (e) => {
    if (startX == null || startY == null) return;
    const deltaX = startX - e.clientX;
    const deltaY = startY - e.clientY;
    if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) > 100) {
      setStartX(null);
      setStartY(null);
      handleDismiss();
    }
  };
  const handleMouseUp = () => setStartY(null);

  const handleTouchStart = (e) => setStartY(e.touches[0].clientY);
  const handleTouchMove = (e) => {
    if (startY == null) return;
    const delta = startY - e.touches[0].clientY;
    if (delta > 100) {
      setStartY(null);
      handleDismiss();
    }
  };
  const handleTouchEnd = () => setStartY(null);

  if (!alarm) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between text-center px-6 py-10 bg-gradient-to-b from-blue-100 to-pink-100">
      {/* 상단 시간 */}
      <div className="text-4xl font-bold text-gray-800 mt-4">{alarm.time}</div>

      {/* 알람 제목 */}
      <div className="mt-2">
        <p className="text-lg text-gray-700 font-semibold">{alarm.title || "알람"}</p>
      </div>

      {/* 알람 메시지 */}
      <div>
        <p className="text-5xl font-black text-gray-900 mb-4 whitespace-pre-line">
          우리 친구<br />일어나야지
        </p>
      </div>

      {/* 드래그 해제용 "네" 버튼 */}
      <div className="mb-8">
        <div
          className="relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-32 h-32 rounded-full bg-blue-300 flex items-center justify-center animate-ping absolute" />
          <button
            className="w-32 h-32 rounded-full bg-blue-500 text-white text-2xl font-bold relative"
          >
            네
          </button>
        </div>
      </div>

      {/* 하단 snooze 옵션 (세로 정렬) */}
      <div className="flex flex-col items-center text-gray-800 text-sm px-4 gap-4">
        <button
          onClick={handleSnooze}
          className="text-base font-semibold text-gray-700"
        >
          싫어
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSnoozeMin(Math.max(1, snoozeMin - 1))}
            className="w-10 h-10 flex items-center justify-center border border-gray-400 rounded-full text-lg font-bold"
          >
            -
          </button>
          <span className="text-base font-semibold">{snoozeMin}분만</span>
          <button
            onClick={() => setSnoozeMin(snoozeMin + 1)}
            className="w-10 h-10 flex items-center justify-center border border-gray-400 rounded-full text-lg font-bold"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
