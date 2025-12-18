import React, { useState } from "react";

const TimePicker = ({ time, setTime }) => (
  <div style={{ textAlign: "center" }}>
    <input
      type="time"
      value={time}
      onChange={(e) => setTime(e.target.value)}
      style={{ fontSize: "1.5rem" }}
    />
  </div>
);

const style = {
  container: {
    margin: "1rem 0",
    textAlign: "center",
  },
  input: {
    fontSize: "1.5rem",
    padding: "0.5rem",
  },
};

export default TimePicker;
