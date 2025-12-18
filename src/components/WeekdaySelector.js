import React, { useState } from "react";

const days = ["월", "화", "수", "목", "금", "토", "일"];

const WeekdaySelector = ({ selected, onChange }) => {
  const toggleDay = (index) => {
    const updated = selected.includes(index)
      ? selected.filter((i) => i !== index)
      : [...selected, index];
    onChange(updated);
  };

  return (
    <div>
      <p>간편 요일 설정</p>
      <div style={style.dayContainer}>
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => toggleDay(i)}
            style={{
              ...style.day,
              backgroundColor: selected.includes(i) ? "#007bff" : "#e0e0e0",
              color: selected.includes(i) ? "white" : "black",
            }}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
};

const style = {
  dayContainer: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "1rem",
  },
  day: {
    width: "30px",
    height: "30px",
    borderRadius: "15px",
    border: "none",
    cursor: "pointer",
  },
};

export default WeekdaySelector;
