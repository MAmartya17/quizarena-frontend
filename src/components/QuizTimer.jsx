import { useEffect, useState, useRef } from "react";

export default function QuizTimer({ durationMinutes, onTimeUp, running = true }) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const calledRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) {
      if (!calledRef.current) {
        calledRef.current = true;
        onTimeUp?.();
      }
      return;
    }
    const timerId = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timerId);
  }, [secondsLeft, running, onTimeUp]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const danger = secondsLeft <= 30;
  const warning = secondsLeft <= 60 && !danger;

  return (
    <div
      style={{
        position: "sticky",
        top: 12,
        zIndex: 50,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        borderRadius: 24,
        fontWeight: 700,
        fontSize: 18,
        fontVariantNumeric: "tabular-nums",
        background: danger ? "#7F1D1D" : warning ? "#78350F" : "#1E293B",
        color: danger ? "#FCA5A5" : warning ? "#FCD34D" : "#E2E8F0",
        border: `1px solid ${danger ? "#EF4444" : warning ? "#F59E0B" : "#334155"}`,
        transition: "all 0.3s ease",
        whiteSpace: "nowrap",
      }}
    >
      ⏱ {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </div>
  );
}