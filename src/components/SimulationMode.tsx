import { useState } from 'react';
import ConvergenceChart from './ConvergenceChart';
import { Button, Card, Group, NumberInput, Progress, Stack, Text, ThemeIcon, Title, Tooltip as MantineTooltip } from '@mantine/core';
import { IconChartBar, IconPlayerPlay, IconSquareRoundedX, IconReportAnalytics, IconBulb, IconInfoCircle } from '@tabler/icons-react';
import { useSimulation } from '../hooks/useSimulation';
import { useConfigStore } from '../store/configStore';
import { theoreticalStayWinProbability, theoreticalSwitchWinProbability } from '../utils/probability';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function SimulationMode() {
  const [count, setCount] = useState<number | ''>(10000);
  const { running, progress, results, run, stop, rates } = useSimulation();
  const { numDoors, numCars, numReveals, set } = useConfigStore();
  const [switchProbPct, setSwitchProbPct] = useState<number | ''>(100);

  const data = [
    { name: 'Switch', rate: Math.round(rates.switchRate * 1000) / 10 },
    { name: 'Stay', rate: Math.round(rates.stayRate * 1000) / 10 },
    { name: `Mixed (${typeof switchProbPct === 'number' ? switchProbPct : 100}%)`, rate: Math.round((rates.mixedRate ?? 0) * 1000) / 10 },
  ];
  const theorySwitch = Math.round(theoreticalSwitchWinProbability(numDoors, numCars, numReveals) * 1000) / 10;
  const theoryStay = Math.round(theoreticalStayWinProbability(numDoors, numCars) * 1000) / 10;
  const theorySwitchRaw = theoreticalSwitchWinProbability(numDoors, numCars, numReveals);
  const theoryStayRaw = theoreticalStayWinProbability(numDoors, numCars);
  const switchProb = typeof switchProbPct === 'number' ? Math.max(0, Math.min(100, switchProbPct)) / 100 : 1;
  const theoryMixed = Math.round((switchProb * theorySwitchRaw + (1 - switchProb) * theoryStayRaw) * 1000) / 10;

  return (
    <Stack gap="lg">
      <Group align="center" gap="xs">
        <IconChartBar size={20} />
        <Title order={3}>Simulation Mode</Title>
      </Group>
      <Text c="dimmed" size="sm">Run many randomized trials to estimate the win rates of always switching vs. always staying. As the number of trials increases, the empirical results should approach 2/3 for switching and 1/3 for staying.</Text>
      <Group wrap="wrap" gap="md">
        <NumberInput
          label="Number of simulations"
          value={count}
          min={1}
          max={1000000}
          step={1000}
          onChange={(v) => {
            if (typeof v === 'number') setCount(v);
            else if (v === '') setCount('');
          }}
        />
        <NumberInput label="Doors (N)" value={numDoors} min={3} max={50} step={1} onChange={(v) => typeof v === 'number' && set({ numDoors: v })} />
        <NumberInput label="Cars (M)" value={numCars} min={1} max={Math.max(1, numDoors - 1)} step={1} onChange={(v) => typeof v === 'number' && set({ numCars: v })} />
        <NumberInput label="Reveals (K)" value={numReveals} min={1} max={Math.max(1, numDoors - 2)} step={1} onChange={(v) => typeof v === 'number' && set({ numReveals: v })} />
        <NumberInput label="Switch probability (%)" value={switchProbPct} min={0} max={100} step={5} onChange={(v) => typeof v === 'number' ? setSwitchProbPct(v) : setSwitchProbPct('')} />
      </Group>
      <Group>
        <Button color="violet" leftSection={<IconPlayerPlay size={16} />} loading={running} onClick={() => typeof count === 'number' && run(count, 1000, { numDoors, numCars, numReveals, switchProb })}>
          Run Simulation
        </Button>
        {running && (
          <Button variant="light" color="red" leftSection={<IconSquareRoundedX size={16} />} onClick={stop}>
            Stop
          </Button>
        )}
      </Group>


      {running && (
        <Card withBorder  p="md">
          <Text size="sm" mb="xs">Running… {progress}%</Text>
          <Progress value={progress} color="violet"  />
        </Card>
      )}

      {results && (
        <Stack gap="lg">
          <Group align="center" gap="xs">
            <ThemeIcon color="violet"><IconReportAnalytics size={16} /></ThemeIcon>
            <Title order={3}>Statistics & Insights</Title>
          </Group>
          <Text c="dimmed" size="sm">
            Empirical win rates from simulation compared to theoretical values for the current configuration (N={numDoors}, M={numCars}, K={numReveals}).
          </Text>

          <Card withBorder p="md">
            <Group justify="space-between" align="flex-start" mb="md">
              <div>
                <Text mb="xs">Empirical win rates from {results.trials.toLocaleString()} simulated trials</Text>
                <Text c="dimmed" size="sm">Theoretical — Switching: {theorySwitch}% | Staying: {theoryStay}% | Mixed ({switchProbPct}%): {theoryMixed}%</Text>
              </div>
              <MantineTooltip
                multiline
                w={300}
                label={`The "Mixed" strategy switches with probability ${switchProbPct}% and stays otherwise. Its theoretical win rate is a weighted average: (${switchProbPct}% × ${theorySwitch}%) + (${100 - (typeof switchProbPct === 'number' ? switchProbPct : 100)}% × ${theoryStay}%) = ${theoryMixed}%. This allows you to explore intermediate strategies between always switching and always staying.`}
              >
                <ThemeIcon color="gray" variant="light" style={{ cursor: 'help' }}>
                  <IconInfoCircle size={16} />
                </ThemeIcon>
              </MantineTooltip>
            </Group>
            <div style={{ width: '100%', height: 280, minWidth: 320, minHeight: 220 }}>
              <ResponsiveContainer>
                <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" domain={[0, 100]} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="rate" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Group mt="sm" gap="xs">
              <ThemeIcon color="violet"><IconBulb size={16} /></ThemeIcon>
              <Text c="dimmed" size="sm">
                As the number of trials grows, empirical rates converge toward the theoretical values.
              </Text>
            </Group>
          </Card>

          {results.history.length > 0 && (
            <ConvergenceChart
              history={results.history}
              theorySwitch={theoreticalSwitchWinProbability(numDoors, numCars, numReveals)}
              theoryStay={theoreticalStayWinProbability(numDoors, numCars)}
            />
          )}

          <Card withBorder p="md">
            <Title order={4}>Why switching can help</Title>
            <Text mt="xs">
              Initially, your first pick has a limited chance of containing a prize. The host then reveals losing doors, which concentrates probability in the remaining closed doors. Switching allows you to capture that shifted probability mass, often improving your odds compared to staying with your original choice.
            </Text>
          </Card>
        </Stack>
      )}
    </Stack>
  );
}
