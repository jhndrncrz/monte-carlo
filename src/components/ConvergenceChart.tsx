import { Card, Group, Stack, Text, Title } from '@mantine/core';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from 'recharts';

type HistoryPoint = { n: number; switchRate: number; stayRate: number };

export default function ConvergenceChart({
  history,
  theorySwitch,
  theoryStay,
  title = 'Convergence of win rates',
}: {
  history: HistoryPoint[];
  theorySwitch: number; // 0..1
  theoryStay: number; // 0..1
  title?: string;
}) {
  const z = 1.96; // ~95% CI
  const data = history.map((h) => {
    const n = Math.max(1, h.n);
    const ps = h.switchRate;
    const pt = h.stayRate;
    const seS = Math.sqrt(Math.max(0, ps * (1 - ps) / n));
    const seT = Math.sqrt(Math.max(0, pt * (1 - pt) / n));
    const sLo = Math.max(0, ps - z * seS) * 100;
    const sHi = Math.min(1, ps + z * seS) * 100;
    const tLo = Math.max(0, pt - z * seT) * 100;
    const tHi = Math.min(1, pt + z * seT) * 100;
    return {
      n,
      switchPct: ps * 100,
      stayPct: pt * 100,
      switchLo: sLo,
      switchHi: sHi,
      stayLo: tLo,
      stayHi: tHi,
    };
  });

  const delta = history.map((h) => ({
    n: Math.max(1, h.n),
    switchErr: Math.abs(h.switchRate - theorySwitch) * 100,
    stayErr: Math.abs(h.stayRate - theoryStay) * 100,
  }));

  return (
    <Card withBorder radius="xl" p="md">
      <Stack gap="xs">
        <Title order={4}>{title}</Title>
        <Text c="dimmed" size="sm">Shaded bands show ~95% confidence intervals (normal approx.). Solid lines are empirical rates. Dashed lines are theoretical.</Text>
        <div style={{ width: '100%', height: 340, minWidth: 320, minHeight: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="n" tickFormatter={(v) => v.toLocaleString()} />
              <YAxis unit="%" domain={[0, 100]} />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} labelFormatter={(l) => `Trials: ${Number(l).toLocaleString()}`} />
              {/* CI ribbons */}
              <Area type="monotone" dataKey="switchHi" stroke={undefined} fill="#7c3aed" fillOpacity={0.12} activeDot={false} dot={false} />
              <Area type="monotone" dataKey="switchLo" stroke={undefined} fill="#7c3aed" fillOpacity={0.12} activeDot={false} dot={false} />
              <Area type="monotone" dataKey="stayHi" stroke={undefined} fill="#a78bfa" fillOpacity={0.12} activeDot={false} dot={false} />
              <Area type="monotone" dataKey="stayLo" stroke={undefined} fill="#a78bfa" fillOpacity={0.12} activeDot={false} dot={false} />
              {/* Empirical lines */}
              <Line type="monotone" dataKey="switchPct" name="Switch (empirical)" stroke="#7c3aed" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="stayPct" name="Stay (empirical)" stroke="#a78bfa" strokeWidth={2} dot={false} />
              {/* Theoretical reference lines */}
              <ReferenceLine y={theorySwitch * 100} stroke="#7c3aed" strokeDasharray="5 5" label={{ value: 'Switch (theory)', position: 'right', fill: '#7c3aed' }} />
              <ReferenceLine y={theoryStay * 100} stroke="#a78bfa" strokeDasharray="5 5" label={{ value: 'Stay (theory)', position: 'right', fill: '#a78bfa' }} />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <Title order={5} mt="md">Absolute error vs. trials</Title>
        <Text c="dimmed" size="sm">Absolute difference |empirical − theoretical|. Lower is better; values shrink toward 0 as trials increase.</Text>
        <div style={{ width: '100%', height: 260, minWidth: 320, minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={delta} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="n" tickFormatter={(v) => v.toLocaleString()} />
              <YAxis unit="%" domain={[0, 100]} />
              <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} labelFormatter={(l) => `Trials: ${Number(l).toLocaleString()}`} />
              <ReferenceLine y={0} stroke="#888" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="switchErr" name="Switch error" stroke="#7c3aed" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="stayErr" name="Stay error" stroke="#a78bfa" strokeWidth={2} dot={false} />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Stack>
    </Card>
  );
}
