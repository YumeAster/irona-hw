import React, { useState, useEffect } from "react";

const ToggleSwitch = ({ label, note, defaultChecked = false, onToggle }) => {
  const [on, setOn] = useState(defaultChecked);

  useEffect(() => {
    if (onToggle) onToggle(on);
  }, [on, onToggle]);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div>
        <label>
          <input
            type="checkbox"
            checked={on}
            onChange={() => setOn(!on)}
            style={{ marginRight: "10px" }}
          />
          {label}
        </label>
      </div>
      {note && <small style={{ color: "#555" }}>{note}</small>}
    </div>
  );
};

export default ToggleSwitch;
