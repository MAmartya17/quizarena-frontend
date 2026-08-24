import { useState } from 'react'

export default function StarRating({ value = 0, onChange, readOnly = false, size = 24 }) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <div style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange?.(n)}
          style={{
            fontSize: size,
            cursor: readOnly ? 'default' : 'pointer',
            color: n <= display ? '#FFB627' : 'rgba(255,255,255,0.2)',
            transition: 'transform 0.1s',
            transform: hover === n ? 'scale(1.2)' : 'scale(1)',
            userSelect: 'none',
          }}
        >★</span>
      ))}
    </div>
  )
}