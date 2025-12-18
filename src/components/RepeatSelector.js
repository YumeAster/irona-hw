import React, { useState } from "react";
import RepeatRuleModal from "./RepeatRuleModal";

const RepeatSelector = ({ rules, setRules }) => {
  const [showModal, setShowModal] = useState(false);

  const handleAddRule = (rule) => {
    setRules([...rules, rule]);
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      <p>세부 주기 설정</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {rules.map((r, idx) => (
          <span
            key={idx}
            style={{
              padding: "0.3rem 0.8rem",
              backgroundColor: "#eee",
              borderRadius: "1rem",
            }}
          >
            {formatRule(r)}
          </span>
        ))}
        <button onClick={() => setShowModal(true)}>＋</button>
      </div>
      {showModal && (
        <RepeatRuleModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddRule}
        />
      )}
    </div>
  );
};

function formatRule(rule) {
  switch (rule.type) {
    case "day_interval":
      return `${rule.value}일마다`;
    case "hour_interval":
      return `${rule.value}시간마다`;
    case "minute_interval":
      return `${rule.value}분마다`;
    case "month_day":
      return `매월 ${rule.value}일`;
    case "year_date":
      return `매년 ${rule.value.month}월 ${rule.value.day}일`;
    case "week_day":
      return `매주 ${dayToKor(rule.value)}`;
    default:
      return "알 수 없음";
  }
}

function dayToKor(day) {
  return (
    {
      Mon: "월요일",
      Tue: "화요일",
      Wed: "수요일",
      Thu: "목요일",
      Fri: "금요일",
      Sat: "토요일",
      Sun: "일요일",
    }[day] || day
  );
}

export default RepeatSelector;
