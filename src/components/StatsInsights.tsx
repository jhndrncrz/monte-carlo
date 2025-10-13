import { Card, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { useConfigStore } from '../store/configStore';
import { theoreticalStayWinProbability, theoreticalSwitchWinProbability } from '../utils/probability';
import { IconReportAnalytics, IconBulb } from '@tabler/icons-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AggregateResults } from '../store/resultsStore';

interface Props {
  results: AggregateResults;
}

export default function StatsInsights({ results }: Props) {
  const { games, switchWins, stayWins } = results;
  const { numDoors, numCars, numReveals } = useConfigStore();
  const switchRate = games ? Math.round((switchWins / games) * 1000) / 10 : 0;
  const stayRate = games ? Math.round((stayWins / games) * 1000) / 10 : 0;
  const data = [
    { name: 'Switch', rate: switchRate },
    { name: 'Stay', rate: stayRate },
  ];
  const theorySwitch = Math.round(theoreticalSwitchWinProbability(numDoors, numCars, numReveals) * 1000) / 10;
  const theoryStay = Math.round(theoreticalStayWinProbability(numDoors, numCars) * 1000) / 10;

  const convergence = Array.from({ length: 50 }, (_, i) => i + 1).map((k) => ({
    n: k * 100,
    switch: 66.7 + (Math.sin(k / 2) * 3),
    stay: 33.3 + (Math.cos(k / 3) * 3),
  }));

  return (
    <Stack gap="lg">
      <Group align="center" gap="xs">
        <ThemeIcon color="violet" ><IconReportAnalytics size={16} /></ThemeIcon>
        <Title order={3}>Statistics & Insights</Title>
      </Group>
          <Text c="dimmed" size="sm">
            This page aggregates outcomes from your manual plays (Play Mode). It shows your empirical win rates for switching and staying, and puts them next to the theoretical values for the current configuration (N/M/K). Use it to understand how your experience compares to the predicted probabilities.
          </Text>
      <Card withBorder  p="md">
  <Text mb="md">Empirical win rates based on your interactive plays</Text>
  <Text c="dimmed" size="sm">Theoretical — Switching: {theorySwitch}% | Staying: {theoryStay}% for N={numDoors}, M={numCars}, K={numReveals}.</Text>
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
          <ThemeIcon color="violet" ><IconBulb size={16} /></ThemeIcon>
          <Text c="dimmed" size="sm">
            As the number of trials grows, switching converges to approximately 66.7% wins. Staying converges to about 33.3%.
          </Text>
        </Group>
      </Card>

      <Card withBorder  p="md">
        <Text mb="md">Convergence illustration (synthetic)</Text>
        <div style={{ width: '100%', height: 300, minWidth: 320, minHeight: 220 }}>
          <ResponsiveContainer>
            <LineChart data={convergence} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="n" label={{ value: 'Trials', position: 'insideBottomRight', offset: -5 }} />
              <YAxis unit="%" domain={[0, 100]} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="switch" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="stay" stroke="#a78bfa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card withBorder  p="md">
        <Title order={4}>Why switching wins about two-thirds of the time</Title>
        <Text mt="xs">
          Initially, your first pick has a 1/3 chance of being the car and 2/3 of being a goat. The host then reveals a goat behind one of the other doors, which does not change your initial 1/3 chance. If you switch, you effectively take the 2/3 probability mass from the unchosen doors. Hence, switching wins about two thirds of the time.
        </Text>
      </Card>
    </Stack>
  );
}
