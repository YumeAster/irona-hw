import React, { useState, useEffect } from "react";

const sentence = "동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세";
const words = sentence.split(" ");

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function SentenceGame({ difficulty = 1, onComplete }) {
  const [shuffled, setShuffled] = useState(shuffle(words));
  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState("playing"); // playing, correct, wrong

  function handleWordClick(word, idx) {
    if (status !== "playing") return;
    const nextSelected = [...selected, word];

    for (let i = 0; i < nextSelected.length; i++) {
      if (nextSelected[i] !== words[i]) {
        setStatus("wrong");
        setTimeout(() => {
          setSelected([]);
          setShuffled(shuffle(words));
          setStatus("playing");
        }, 1000);
        return;
      }
    }

    if (nextSelected.length === words.length) {
      setSelected(nextSelected);
      setStatus("correct");
    } else {
      setSelected(nextSelected);
    }
  }

  // 정답 도달 시 onComplete 호출
  useEffect(() => {
    if (status === "correct") {
      onComplete?.();
    }
  }, [status, onComplete]);

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <div style={{ fontWeight: "bold", marginBottom: 10 }}>
        순서대로 문장을 완성하세요
      </div>
      <div style={{ marginBottom: 12 }}>
        {shuffled.map((word, idx) => (
          <button
            key={idx}
            onClick={() => handleWordClick(word, idx)}
            disabled={selected.includes(word) || status !== "playing"}
            style={{
              margin: 4,
              padding: "8px 14px",
              background: selected.includes(word) ? "#ddd" : "#fff",
              border: "1px solid #333",
              borderRadius: "8px",
              cursor: selected.includes(word) ? "not-allowed" : "pointer",
              opacity: selected.includes(word) ? 0.5 : 1,
              fontSize: "1rem",
              fontFamily: "inherit"
            }}
          >
            {word}
          </button>
        ))}
      </div>
      <div style={{
        minHeight: 40,
        marginBottom: 10,
        border: "2px solid #888",
        borderRadius: "10px",
        background: "#e8f0fe",
        boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
        padding: 16
      }}>
        {selected.length === 0
          ? <span style={{ color: "#bbb" }}>여기에 단어가 들어갑니다.</span>
          : selected.map((word, idx) => (
            <span key={idx} style={{
              marginRight: 6,
              fontWeight: 500,
              fontSize: "1.05rem"
            }}>{word}</span>
          ))
        }
      </div>
      {status === "wrong" && (
        <div style={{ color: "red", fontWeight: "bold" }}>
          잘못된 순서입니다!
        </div>
      )}
      {status === "correct" && (
        <div style={{ color: "green", fontWeight: "bold" }}>
          정답입니다!
        </div>
      )}
    </div>
  );
}
