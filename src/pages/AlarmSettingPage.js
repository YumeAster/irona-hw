// -------------------- AlarmSettingPage.js --------------------
import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import TimePickerCircular from "../components/TimePickerCircular";
import WeekdaySelector from "../components/WeekdaySelector";
import RepeatSelector from "../components/RepeatSelector";
import ToggleSwitch from "../components/ToggleSwitch";

export default function AlarmSettingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const existing = location.state?.alarm;

  // ✨ 기본값으로 안전하게 처리
  const [alarmTime, setAlarmTime] = useState(existing?.time || "00:00");
  const [isGameAlarm, setIsGameAlarm] = useState(existing?.category === "game");
  const [isRepeatMode, setIsRepeatMode] = useState(existing?.useRepeat || false);
  const [repeatRules, setRepeatRules] = useState(existing?.repeatRules || []);
  const [selectedWeekdays, setSelectedWeekdays] = useState(existing?.weekdays || []);
  const [title, setTitle] = useState(existing?.title || "");

  const handleSubmit = () => {
    const alarmData = {
      id: existing ? existing.id : Date.now(),
      category: isGameAlarm ? "game" : "basic",
      title: title,
      time: alarmTime,
      useRepeat: isRepeatMode,
      enabled: existing ? existing.enabled : true,
      repeatRules: isRepeatMode ? repeatRules : [],
      weekdays: isRepeatMode ? [] : selectedWeekdays,
    };
    navigate("/HomePage", { state: { alarm: alarmData } });
  };

  const handleDelete = () => {
    if (existing) {
      navigate("/HomePage", { state: { deleteId: existing.id } });
    } else {
      navigate("/HomePage");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto", position: "relative" }}>
      <h2>{existing ? "📝 알람 수정" : "🕒 알람 생성"}</h2>
      <TimePickerCircular time={alarmTime} setTime={setAlarmTime} />

      <label htmlFor="alarm-title" style={{ display: "block", marginBottom: "0.5rem" }}>알람 이름</label>
      <input
        id="alarm-title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          fontSize: "1rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "1rem"
        }}
      />

      <div style={{ marginBottom: "2rem" }}>
        {isRepeatMode ? (
          <RepeatSelector rules={repeatRules} setRules={setRepeatRules} />
        ) : (
          <WeekdaySelector selected={selectedWeekdays} onChange={setSelectedWeekdays} />
        )}
      </div>

      <ToggleSwitch
        label="게임 알람 여부"
        note="체크하면 게임 알람으로 설정됩니다."
        defaultChecked={isGameAlarm}
        onToggle={(checked) => setIsGameAlarm(checked)}
      />

      <ToggleSwitch
        label="세부 주기 설정"
        note="체크하면 요일 주기 설정이 비활성화 됩니다."
        defaultChecked={isRepeatMode}
        onToggle={(checked) => setIsRepeatMode(checked)}
      />

      <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between" }}>
        <button onClick={handleSubmit} style={{ padding: "0.5rem 1rem" }}>확인</button>
        {existing && (
          <button
            onClick={handleDelete}
            style={{ padding: "0.5rem 1rem", backgroundColor: "#ffdddd", color: "#a00", border: "1px solid #a00" }}
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
