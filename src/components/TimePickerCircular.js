import React, { useState, useCallback, useEffect } from "react";
import CircularSlider from "react-circular-slider-svg";

const pad = (n) => n.toString().padStart(2, "0");

const getSliderValue = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  const h12 = h % 12;
  return h12 * 60 + m;
};

const getMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

const TimePickerCircular = ({ time, setTime }) => {
  const [editing, setEditing] = useState(false);
  const [isAM, setIsAM] = useState(true);
  const [tempValue, setTempValue] = useState(getSliderValue(time));

  useEffect(() => {
    setTempValue(getSliderValue(time));
    const [h] = time.split(":").map(Number);
    setIsAM(h < 12);
  }, [time]);

  const formatDisplay = (value) => {
    let h = Math.floor(value / 60);
    let m = Math.round(value % 60);
    if (m === 60) {
      h += 1;
      m = 0;
    }
    const isCurrentlyAM = isAM;
    const displayHour = h === 0 ? 12 : h;
    return `${isCurrentlyAM ? "오전" : "오후"} ${displayHour}:${pad(m)}`;
  };

  const handleSliderChange = useCallback((value) => {
    setTempValue(value);
  }, []);

  const handleSliderFinish = () => {
    const total = Math.floor(tempValue);
    let h = Math.floor(total / 60);
    let m = total % 60;
    if (m === 60) {
      h += 1;
      m = 0;
    }

    const hour24 = isAM ? (h === 12 ? 0 : h) : h === 12 ? 12 : h + 12;

    const newTime = `${pad(hour24)}:${pad(m)}`;
    if (newTime !== time) {
      setTime(newTime);
    }
  };

  const handleInputChange = (value) => {
    const [h, m] = value.split(":").map(Number);
    if (h < 12 !== isAM) setIsAM(h < 12);
    const hour12 = h % 12;
    const fullHour = (isAM ? hour12 : hour12 + 12) % 24;
    const newTime = `${pad(fullHour)}:${pad(m)}`;
    if (newTime !== time) setTime(newTime);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "250px",
        margin: "0 auto",
        transform: "rotate(180deg)",
      }}
    >
      <CircularSlider
        size={250}
        minValue={0}
        maxValue={719}
        trackWidth={10}
        startAngle={0}
        endAngle={360}
        arcColor="#eeeeee"
        arcBackgroundColor="#eeeeee"
        handle1={{
          value: tempValue,
          onChange: handleSliderChange,
          color: "rgb(131, 205, 255)",
        }}
        onControlFinished={handleSliderFinish}
      />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-180deg)",
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "#333",
          userSelect: "none",
        }}
      >
        {/* 오전/오후 토글 */}
        <div
          onClick={() => setIsAM(!isAM)}
          style={{
            fontSize: "0.9rem",
            cursor: "pointer",
            marginBottom: "0.3rem",
            fontWeight: "normal",
            color: "#666",
          }}
        >
          {isAM ? "오전" : "오후"} (클릭 전환)
        </div>

        {/* 시간 표시 or 입력 */}
        {editing ? (
          <input
            type="time"
            value={time}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={() => setEditing(false)}
            style={{ fontSize: "1.2rem" }}
          />
        ) : (
          <div onClick={() => setEditing(true)}>{formatDisplay(tempValue)}</div>
        )}
      </div>
    </div>
  );
};

export default TimePickerCircular;
