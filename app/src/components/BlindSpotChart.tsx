import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine, Legend,
} from 'recharts'
import { fmt } from '@/lib/data'

export type Pt = { km: number; guess: number; gentle: number; taxi: number }

const tick = { fill: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'var(--font-mono)' }

/** Lazy-loaded so Recharts stays off the first paint of Home. */
export default function BlindSpotChart({ data, km, soh, habit }: { data: Pt[]; km: number; soh: number; habit: 'gentle' | 'taxi' }) {
  return (
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey="km" type="number" domain={[0, 150000]} tickCount={7} tickLine={false} axisLine={{ stroke: 'var(--border)' }}
          tick={tick} tickFormatter={(v: number) => `${v / 1000}k`} />
        <YAxis domain={[70, 100]} tickLine={false} axisLine={false} width={44} tick={tick} tickFormatter={(v: number) => `${v}%`} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--card-foreground)', fontSize: 12 }}
          labelFormatter={(v) => `${fmt(Number(v))} km`}
          formatter={(v, n) => [`${Number(v).toFixed(1)}%`, n === 'guess' ? 'Mileage-only guess' : n === 'gentle' ? 'Car A · measured' : 'Car B · measured']} />
        <Legend verticalAlign="top" height={28} iconType="plainline"
          formatter={(v) => <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{v === 'guess' ? 'What the odometer implies' : v === 'gentle' ? 'Car A · gentle commuting' : 'Car B · your settings'}</span>} />
        <ReferenceLine y={92} stroke="var(--border)" strokeDasharray="4 4" label={{ value: 'Grade A line', position: 'insideTopRight', fill: 'var(--muted-foreground)', fontSize: 10.5 }} />
        <Line type="monotone" dataKey="guess" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="gentle" stroke="var(--grade-a)" strokeWidth={habit === 'gentle' ? 3 : 1.5} strokeOpacity={habit === 'gentle' ? 1 : 0.45} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="taxi" stroke="var(--teal)" strokeWidth={habit === 'taxi' ? 3 : 1.5} strokeOpacity={habit === 'taxi' ? 1 : 0.45} dot={false} isAnimationActive={false} />
        <ReferenceDot x={km} y={soh} r={6} fill="var(--brand)" stroke="var(--card)" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
