// -------------------- HomePage.js --------------------
// 알람 목록 화면 (기능 유지 + 신규 디자인 반영)
// ---------------------------------------------------------------------
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiMoreVertical, FiPlus } from "react-icons/fi";
import { SiGoogledrive } from "react-icons/si";
import dayjs from "dayjs";
import { useBluetooth } from "../utils/useBluetooth"; 

import {
  initGoogleAPI,
  getStoredGoogleUser,
  saveToDrive,
  loadFromDrive,
} from "../utils/googleDrive";

/* ------------------------------------------------------------------
 * 디자인용 아이콘 (이모지)
 * ----------------------------------------------------------------*/
const AlarmIcon = ({ category }) => {
  switch (category) {
    case "quick":
      return <span className="text-yellow-500 text-lg">⚡</span>;
    case "game":
      return <span className="text-purple-500 text-lg">🎮</span>;
    default:
      return <span className="text-blue-500 text-lg">⏰</span>;
  }
};

/* ------------------------------------------------------------------
 * 토글 스위치 (디자인 반영)
 * ----------------------------------------------------------------*/
const AlarmToggle = ({ isEnabled, onToggle }) => (
  <button
    type="button"
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isEnabled ? "bg-blue-500" : "bg-gray-300"}`}
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isEnabled ? "translate-x-6" : "translate-x-1"}`}
    />
  </button>
);

/* ------------------------------------------------------------------
 * 로컬스토리지 키
 * ----------------------------------------------------------------*/
const STORAGE_KEY = "alarms_v1";

/* ------------------------------------------------------------------
 * HomePage Component
 * ----------------------------------------------------------------*/
export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  /* -------------------- 알람 목록 상태 -------------------- */
  const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  const [alarmList, setAlarmList] = useState(persisted ?? []);

  /* -------------------- 구글 드라이브 -------------------- */
  const isLoggedIn = getStoredGoogleUser();

  const handleManualSave = async () => {
    await saveToDrive(alarmList);
  };

  const handleManualLoad = async () => {
    const data = await loadFromDrive();
    if (data) {
      setAlarmList(data);
      alert("Drive에서 불러왔습니다!");
    }
  };

  /* -------------------- 블루투스 -------------------- */
  const { 
    device, 
    isConnected, 
    isSearching, 
    requestDevice, 
    disconnect,
    error,
  } = useBluetooth();


  /* -------------------- location.state 병합 (add / update / delete) -------------------- */

  useEffect(() => {
    if (!location.state) return;

    setAlarmList((prev) => {
      let next = [...prev];

      // ✅ 삭제 처리
      if (location.state.deleteId) {
        next = next.filter((a) => a.id !== location.state.deleteId);
      }

      // ✅ alarm 또는 alarms를 배열로 처리
      const incomingAlarms = [];

      if (location.state.alarms && Array.isArray(location.state.alarms)) {
        incomingAlarms.push(...location.state.alarms);
      } else if (location.state.alarm) {
        incomingAlarms.push(location.state.alarm);
      }

      for (const alarm of incomingAlarms) {
        const idx = next.findIndex((a) => a.id === alarm.id);
        if (idx !== -1) {
          next[idx] = alarm; // 수정
        } else {
          next.unshift(alarm); // 추가
        }
      }

      return next;
    });

    // ✅ 상태 소비 후 초기화
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  /* -------------------- 로컬스토리지 동기화 & 구글 드라이브 초기화 -------------------- */
  useEffect(() => {
    initGoogleAPI().then(() => {
      console.log("✅ Google API ready");
    });
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarmList));
  }, [alarmList]);

  /* ------------------------------------------------------------------
      정해진 시간에 알람 실행
   * ----------------------------------------------------------------*/
const firedMapRef = useRef({}); // { alarmId: "YYYY-MM-DD" }

useEffect(() => {
  let timerId;

  // 1) 알람 조건 검사 함수
  const runCheck = () => {
    const now          = dayjs();
    const hhmm         = now.format("HH:mm");
    const todayWday    = now.day();           // 0=Sun … 6=Sat
    const todayStr     = now.format("YYYY-MM-DD");

    alarmList.forEach((alarm) => {
      if (!alarm.enabled) return;
      if (firedMapRef.current[alarm.id] === todayStr) return;   // 이미 울렸음
      if (alarm.time !== hhmm)          return;                 // 시간 불일치
      if (Array.isArray(alarm.weekdays) &&
          alarm.weekdays.length > 0 &&
          !alarm.weekdays.includes(todayWday)) return;          // 요일 불일치

      /* ---- 알람 실행 ---- */
      switch (alarm.category) {
        case "quick":
          navigate(`/alarm/ring/${alarm.id}`, { state: { alarm } });
          setAlarmList((prev) => prev.filter((a) => a.id !== alarm.id));
          break;
        case "game":
          navigate(`/alarm/game/${alarm.id}`, { state: { alarm } });
          break;
        default:
          navigate(`/alarm/ring/${alarm.id}`, { state: { alarm } });
      }
      firedMapRef.current[alarm.id] = todayStr; // 중복 방지
    });
  };

  // 2) 다음 “분 경계(00초)” 까지 예약 → 이후 1분마다 재귀
  const scheduleNext = () => {
    const msUntilNextMinute = 1_000 - (Date.now() % 1_000);
    timerId = setTimeout(() => {
      runCheck();     // 정확히 00초 즈음 실행
      scheduleNext(); // 다음 분 예약
    }, msUntilNextMinute);
  };

  scheduleNext();     // 첫 예약

  return () => clearTimeout(timerId); // 언마운트/알람목록 변경 시 정리
}, [alarmList]);



  /* -------------------- 토글 -------------------- */
  const handleToggle = useCallback((id) => {
    setAlarmList((prev) =>
      prev.map((alarm) =>
        alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
      )
    );
  }, []);

  /* -------------------- 네비게이션 -------------------- */
  const goSettings = () => navigate("/settings");
  const goNewAlarm = () => navigate("/alarm/new");
  const goEditAlarm = (alarm) => navigate(`/alarm/${alarm.id}`, { state: { alarm } });

  /* -------------------- + 버튼 (길게/짧게) -------------------- */
  const pressTimerRef = useRef(null);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickTime, setQuickTime] = useState("00:00");

  const onPlusDown = () => {
    pressTimerRef.current = setTimeout(() => setShowQuickModal(true), 600);
  };
  const onPlusUp = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
      if (!showQuickModal) goNewAlarm();
    }
  };

  /* -------------------- 퀵 알람 생성 -------------------- */
  const handleQuickConfirm = () => {
    const newAlarm = {
      id: Date.now(),
      category: "quick",
      title: `퀵 알람 (${quickTime})`,
      time: quickTime,
      enabled: true,
      repeatInfo: "한 번만 울림",
    };
    setAlarmList((prev) => [newAlarm, ...prev]);
    setShowQuickModal(false);
  };

  /* -------------------- 알람 Row -------------------- */
  const AlarmRow = ({ alarm }) => {
    const displayTitle = alarm.title && alarm.title.trim() !== ""
      ? alarm.title
      : alarm.category === "game"
        ? "게임 알람"
        : alarm.category === "quick"
          ? "퀵 알람"
          : "일반 알람";

    const rowBg = alarm.enabled ? "bg-white hover:bg-gray-50" : "bg-gray-100 hover:bg-gray-200";

    return (
      <div
        className={`flex items-center justify-between px-4 py-4 cursor-pointer transition-colors ${rowBg}`}
        onClick={() => goEditAlarm(alarm)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <AlarmIcon category={alarm.category} />
          <div className="flex-1 min-w-0">
            <div className="text-base font-medium text-gray-900 truncate">
              {displayTitle}
            </div>
            <div className="text-sm text-gray-500 mt-0.5 truncate">
              {alarm.repeatInfo ?? alarm.subtitle ?? ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-lg font-semibold text-gray-900">
            {alarm.time}
          </div>
          <AlarmToggle
            isEnabled={alarm.enabled}
            onToggle={() => handleToggle(alarm.id)}
          />
        </div>
      </div>
    );
  };

  /* ------------------------------------------------------------------
 * 블루투스 버튼 컴포넌트
 * ----------------------------------------------------------------*/
  const BluetoothButton = ({ isConnected, isSearching, deviceName, onConnect, onDisconnect }) => {
    let buttonText = "BLE 연결";
    let buttonStyle = "bg-blue-500 hover:bg-blue-600";
    let handler = onConnect;
    
    if (isSearching) {
      buttonText = "검색 중...";
      buttonStyle = "bg-yellow-500 animate-pulse cursor-wait";
      handler = () => {}; // 검색 중에는 동작 방지
    } else if (isConnected) {
      buttonText = deviceName ? `${deviceName} 연결됨` : "BLE 연결됨";
      buttonStyle = "bg-green-500 hover:bg-green-600";
      handler = onDisconnect; // 연결 상태일 때는 해제 함수 연결
    }

    return (
      <button
        onClick={handler}
        className={`px-3 py-1 text-white rounded-lg text-sm font-medium transition-colors ${buttonStyle}`}
        type="button"
        disabled={isSearching}
      >
        {buttonText}
      </button>
    );
  };

  /* -------------------- 렌더 -------------------- */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
          <header className="bg-white px-6 pt-12 pb-4 shadow">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">알람 목록 화면</h1>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <SiGoogledrive size={22} color="#4285F4" />

              {/* ✅ 수동 저장/불러오기 버튼 */}
              <button
                onClick={handleManualLoad}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                불러오기
              </button>
              <button
                onClick={handleManualSave}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
              >
                저장하기
              </button>
            </>
          ) : (<></>)}
          <button
            onClick={goSettings}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="설정"
            type="button"
          >
            <FiMoreVertical size={22} />
          </button>
          {/* ✅ 블루투스 연결/해제 버튼 */}
            <BluetoothButton 
                isConnected={isConnected}
                isSearching={isSearching}
                deviceName={device?.name}
                onConnect={requestDevice}
                onDisconnect={disconnect}
            />
        </div>
      </div>
    </header>

      {/* 알람 리스트 */}
      <main className="px-4 py-2">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
          {alarmList.length === 0 ? (
            <p className="text-center text-gray-500 py-8">알람이 없습니다.</p>
          ) : (
            alarmList.map((alarm) => <AlarmRow key={alarm.id} alarm={alarm} />)
          )}
        </div>
      </main>

      {/* + 버튼 */}
      <button
        className="fixed bottom-8 right-6 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
        onMouseDown={onPlusDown}
        onMouseUp={onPlusUp}
        onMouseLeave={onPlusUp}
        onTouchStart={onPlusDown}
        onTouchEnd={onPlusUp}
        aria-label="새 알람"
        type="button"
      >
        <FiPlus size={22} />
      </button>

      {/* 퀵알람 모달 */}
      {showQuickModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
            onClick={() => setShowQuickModal(false)}
          />
          <div className="fixed inset-x-0 bottom-0 rounded-t-3xl bg-white p-6 shadow-xl z-50 animate-slideUp">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-6 text-center">퀵 알람 시간</h2>
            <div className="text-center py-8">
              <input
                type="time"
                value={quickTime}
                onChange={(e) => setQuickTime(e.target.value)}
                className="text-4xl font-light text-gray-800 bg-transparent border-none outline-none"
              />
              <div className="text-sm text-gray-500 mt-2">시간을 선택하세요</div>
            </div>
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                onClick={() => setShowQuickModal(false)}
                type="button"
              >
                취소
              </button>
              <button
                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                onClick={handleQuickConfirm}
                type="button"
              >
                확인
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}



