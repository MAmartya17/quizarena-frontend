import { useEffect, useState } from 'react';
import { MandalaIcon } from './Icons';

export default function MovingBackground() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const arr = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 3 + Math.random() * 5,
      dur: 12 + Math.random() * 18,
      delay: Math.random() * -20,
      color: ['#FFB627', '#FF6B35', '#009B8E', '#E5383B'][i % 4],
    }));
    setParticles(arr);
  }, []);

  return (
    <>
      {/* Mandala orbits */}
      <div className="bg-orbits">
        <div className="orbit orbit-1" style={{ color: '#FF6B35' }}>
          <MandalaIcon size="100%" />
        </div>
        <div className="orbit orbit-2" style={{ color: '#009B8E' }}>
          <MandalaIcon size="100%" />
        </div>
        <div className="orbit orbit-3" style={{ color: '#FFB627' }}>
          <MandalaIcon size="100%" />
        </div>
        <div className="orbit orbit-4" style={{ color: '#3A0CA3' }}>
          <MandalaIcon size="100%" />
        </div>
      </div>

      {/* Floating spice particles */}
      {particles.map(p => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            '--dur': `${p.dur}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  );
}