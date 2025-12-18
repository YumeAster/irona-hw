import React, { useState } from "react";

const modalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "white",
  padding: "2rem",
  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
  zIndex: 1000,
  borderRadius: "10px",
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.3)",
  zIndex: 999,
};

const RepeatRuleModal = ({ onClose, onAdd }) => {
  const [type, setType] = useState("day_interval");
  const [value, setValue] = useState("");

  const handleAdd = () => {
    if (!value) return;
    let parsedValue =
      type === "year_date"
        ? {
            month: parseInt(value.split("-")[0]),
            day: parseInt(value.split("-")[1]),
          }
        : type === "week_day"
        ? value
        : parseInt(value);

    onAdd({ type, value: parsedValue });
    onClose();
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={modalStyle}>
        <h3>새 주기 규칙 추가</h3>
        <label>주기 종류:</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ width: "100%" }}
        >
          <option value="day_interval">N일마다</option>
          <option value="hour_interval">N시간마다</option>
          <option value="minute_interval">N분마다</option>
          <option value="month_day">매월 N일</option>
          <option value="year_date">매년 N월 M일</option>
          <option value="week_day">매주 N요일</option>
        </select>

        <div style={{ marginTop: "1rem" }}>
          <label>값 입력: </label>
          {type === "year_date" ? (
            <input
              type="text"
              placeholder="4-1"
              onChange={(e) => setValue(e.target.value)}
            />
          ) : type === "week_day" ? (
            <select onChange={(e) => setValue(e.target.value)}>
              <option value="Mon">월요일</option>
              <option value="Tue">화요일</option>
              <option value="Wed">수요일</option>
              <option value="Thu">목요일</option>
              <option value="Fri">금요일</option>
              <option value="Sat">토요일</option>
              <option value="Sun">일요일</option>
            </select>
          ) : (
            <input type="number" onChange={(e) => setValue(e.target.value)} />
          )}
        </div>

        <div style={{ marginTop: "1rem", textAlign: "right" }}>
          <button onClick={onClose} style={{ marginRight: "10px" }}>
            취소
          </button>
          <button onClick={handleAdd}>추가</button>
        </div>
      </div>
    </>
  );
};

export default RepeatRuleModal;
