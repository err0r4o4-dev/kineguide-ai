import type { PoseTrackingSnapshot } from './usePoseTracking'

const CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 7],
  [0, 4],
  [4, 5],
  [5, 6],
  [6, 8],
  [9, 10],
  [11, 12],
  [11, 13],
  [13, 15],
  [15, 17],
  [15, 19],
  [15, 21],
  [17, 19],
  [12, 14],
  [14, 16],
  [16, 18],
  [16, 20],
  [16, 22],
  [18, 20],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [24, 26],
  [25, 27],
  [26, 28],
  [27, 29],
  [28, 30],
  [29, 31],
  [30, 32],
  [27, 31],
  [28, 32]
] as const

export function PoseOverlay({ snapshot }: { snapshot: PoseTrackingSnapshot }) {
  const { bounds, landmarks, status, unreliableLandmarks } = snapshot
  if (!landmarks || !bounds) return null

  const isReady = status === 'ready'
  const stroke = isReady ? '#34d399' : '#fbbf24'
  const unreliable = new Set(unreliableLandmarks)

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full [transform:scaleX(-1)]"
      preserveAspectRatio="none"
      viewBox="0 0 1 1"
    >
      <rect
        fill="none"
        height={bounds.height}
        rx="0.025"
        stroke={stroke}
        strokeDasharray={isReady ? undefined : '0.018 0.012'}
        strokeWidth="0.008"
        vectorEffect="non-scaling-stroke"
        width={bounds.width}
        x={bounds.x}
        y={bounds.y}
      />
      {CONNECTIONS.map(([start, end]) => {
        const from = landmarks[start]
        const to = landmarks[end]
        if (!from || !to || unreliable.has(start) || unreliable.has(end)) {
          return null
        }
        return (
          <line
            key={`${start}-${end}`}
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth="0.007"
            vectorEffect="non-scaling-stroke"
            x1={from.x}
            x2={to.x}
            y1={from.y}
            y2={to.y}
          />
        )
      })}
      {landmarks.map((landmark, index) =>
        (landmark.visibility ?? 0) >= 0.5 ? (
          <circle
            cx={landmark.x}
            cy={landmark.y}
            fill={unreliable.has(index) ? '#fbbf24' : '#f8fafc'}
            key={index}
            r="0.009"
            stroke={stroke}
            strokeWidth="0.004"
            vectorEffect="non-scaling-stroke"
          />
        ) : null
      )}
    </svg>
  )
}
