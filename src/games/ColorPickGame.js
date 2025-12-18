import React, { useEffect, useState } from "react";
import "../App.css";

function generateColorGrid(gridSize, baseColor) {
  const grid = [];
  const step = 1 / (gridSize - 1);
  for (let i = 0; i < gridSize; i++) {
    const row = [];
    for (let j = 0; j < gridSize; j++) {
      const r = Math.round(baseColor.r * (1 - i * step) + 255 * (i * step));
      const g = Math.round(baseColor.g * (1 - j * step) + 255 * (j * step));
      const b = Math.round(baseColor.b * (1 - (i + j) * step / 2) + 255 * ((i + j) * step / 2));
      row.push(`rgb(${r}, ${g}, ${b})`);
    }
    grid.push(row);
  }
  return grid;
}

function getRandomBaseColor() {
  return {
    r: Math.floor(Math.random() * 156), // 0~155로 제한해서 너무 밝은 색 방지
    g: Math.floor(Math.random() * 156),
    b: Math.floor(Math.random() * 156)
  };
}

export default function ColorPickGame({ difficulty = 1, onComplete }) {
  const [grid, setGrid] = useState([]);
  const [targetColor, setTargetColor] = useState(null);
  const [shake, setShake] = useState(false);
  const gridSize = [3, 5, 7][difficulty] || 5;

  useEffect(() => {
    const baseColor = getRandomBaseColor();
    const newGrid = generateColorGrid(gridSize, baseColor);
    setGrid(newGrid);
    const targetRow = Math.floor(Math.random() * gridSize);
    const targetCol = Math.floor(Math.random() * gridSize);
    setTargetColor(newGrid[targetRow][targetCol]);
  }, [difficulty]);

  function handleClick(color) {
    if (color === targetColor) {
      onComplete();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1rem" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>색 찾기</h2>
      <div
        style={{ width: "6rem", height: "6rem", borderRadius: "1rem", border: "4px solid white", marginBottom: "1rem", backgroundColor: targetColor }}
      ></div>
      <div
        className={shake ? "animate-shake" : ""}
        style={{
          display: "grid",
          width: "min(90vw, 360px)",
          aspectRatio: "1 / 1",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          gap: "0.25rem"
        }}
      >
        {grid.flat().map((color, index) => (
          <button
            key={index}
            onClick={() => handleClick(color)}
            style={{ backgroundColor: color, width: "100%", height: "100%", borderRadius: "0.5rem", border: "none" }}
          />
        ))}
      </div>
    </div>
  );
}