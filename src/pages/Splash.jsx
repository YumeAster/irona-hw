import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Splash = () => {
  const canvasRef = useRef(null);
  const [time, setTime] = useState('');
  const [dots, setDots] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const now = () => new Date();
    setTime(now().toLocaleTimeString('ko-KR', { hour12: false }));

    const clockInterval = setInterval(() => {
      setTime(now().toLocaleTimeString('ko-KR', { hour12: false }));
    }, 1000);

    const loadingInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const timeout = setTimeout(() => {
      navigate('/HomePage');
    }, 5000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(loadingInterval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  // ✅ 아날로그 시계
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const radius = canvas.height / 2;

    // ✔️ 좌표계 이동은 단 한 번
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 원래 좌표계 리셋
    ctx.translate(radius, radius);

    const drawClock = () => {
      // 지우기
      ctx.clearRect(-radius, -radius, canvas.width, canvas.height);

      // 배경 원
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.95, 0, 2 * Math.PI);
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.stroke();

      // 숫자
      ctx.font = `${radius * 0.15}px arial`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      for (let num = 1; num <= 12; num++) {
        const angle = (num * Math.PI) / 6;
        ctx.save();
        ctx.rotate(angle);
        ctx.translate(0, -radius * 0.85);
        ctx.rotate(-angle);
        ctx.fillStyle = '#fff';
        ctx.fillText(num.toString(), 0, 0);
        ctx.restore();
      }

      // 바늘 그리기
      const now = new Date();
      const hour = now.getHours() % 12;
      const minute = now.getMinutes();
      const second = now.getSeconds();

      const hourPos = (hour * Math.PI) / 6 + (minute * Math.PI) / (6 * 60);
      const minutePos = (minute * Math.PI) / 30 + (second * Math.PI) / (30 * 60);
      const secondPos = (second * Math.PI) / 30;

      const drawHand = (pos, length, width, color = '#fff') => {
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;
        ctx.moveTo(0, 0);
        ctx.rotate(pos);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.rotate(-pos);
      };

      drawHand(hourPos, radius * 0.5, 6);
      drawHand(minutePos, radius * 0.75, 4);
      drawHand(secondPos, radius * 0.85, 2, '#f00');
    };

    drawClock();
    const interval = setInterval(drawClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} width="200" height="200" style={styles.canvas}></canvas>
      <div style={styles.clock}>{time}</div>
      <div style={styles.loading}>로딩 중{dots}</div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#000',
    color: '#fff',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'sans-serif',
  },
  canvas: {
    marginBottom: '20px',
  },
  clock: {
    fontSize: '2em',
    marginBottom: '10px',
  },
  loading: {
    fontSize: '1.3em',
  },
};

export default Splash;
