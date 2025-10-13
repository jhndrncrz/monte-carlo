import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, Group, NumberInput, Stack, Text, ThemeIcon, Title, Progress } from '@mantine/core';
import { IconArrowsExchange, IconPlayerPause, IconPlayerPlay, IconPlayerTrackNext, IconPlayerTrackPrev, IconRotate, IconReportAnalytics, IconBulb, IconTrendingUp } from '@tabler/icons-react';
import DoorCard from './DoorCard';
import { useMontyHallGame } from '../hooks/useMontyHallGame';
import { useResultsStore } from '../store/resultsStore';
import confetti from 'canvas-confetti';
import { useConfigStore } from '../store/configStore';
import { theoreticalStayWinProbability, theoreticalSwitchWinProbability } from '../utils/probability';
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import ConvergenceChart from './ConvergenceChart';

export default function PlayMode() {
  const { state, doorStatuses, chooseDoor, switchChoice, reset, getSnapshot, loadSnapshot } = useMontyHallGame();
  const addResult = useResultsStore((s) => s.addResult);
  const { numDoors, numCars, numReveals } = useConfigStore();
  const [autoReplay, setAutoReplay] = useState(false);
  const [replaySpeedMs, setReplaySpeedMs] = useState<number | ''>(500);
  const [autoSwitchProb, setAutoSwitchProb] = useState<number | ''>(100); // percent
  const autoTimer = useRef<number | null>(null);
  const historyRef = useRef<ReturnType<typeof getSnapshot>[]>([]);
  const cursorRef = useRef<number>(-1); // index into historyRef
  const navigatingRef = useRef<boolean>(false);

  useEffect(() => {
    if (state.step === 'result' && state.lastWin) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }
  }, [state.step, state.lastWin]);

  const onSwitch = (switched: boolean) => {
    const res = switchChoice(switched);
    if (res) addResult(res.win, res.switched);
  };

  // Record snapshots whenever we transition to a new step to support Previous/Next
  useEffect(() => {
    if (navigatingRef.current) {
      // Skip recording when we're navigating through history
      navigatingRef.current = false;
      return;
    }
    const snap = getSnapshot();
    const hist = historyRef.current;
    // If we've stepped back and then make a new move, truncate forward history
    if (cursorRef.current < hist.length - 1) {
      hist.splice(cursorRef.current + 1);
    }
    hist.push(snap);
    cursorRef.current = hist.length - 1;
  }, [state.step]);

  const stepPrev = () => {
    const idx = cursorRef.current - 1;
    if (idx >= 0) {
      cursorRef.current = idx;
      navigatingRef.current = true;
      loadSnapshot(historyRef.current[idx]);
    }
  };
  const stepNext = () => {
    const idx = cursorRef.current + 1;
    if (idx < historyRef.current.length) {
      cursorRef.current = idx;
      navigatingRef.current = true;
      loadSnapshot(historyRef.current[idx]);
    } else {
      // If we're at the end, synthesize the next state deterministically for manual stepping
      if (state.step === 'choose') {
        chooseDoor(Math.floor(Math.random() * numDoors));
      } else if (state.step === 'switch') {
        const p = typeof autoSwitchProb === 'number' ? Math.max(0, Math.min(100, autoSwitchProb)) / 100 : 1;
        onSwitch(Math.random() < p);
      } else if (state.step === 'result') {
        reset();
      }
    }
  };
  const resetReplay = () => {
    setAutoReplay(false);
    historyRef.current = [];
    cursorRef.current = -1;
    navigatingRef.current = true;
    reset();
    useResultsStore.getState().reset();
  };

  // Auto Replay loop: choose a door, switch with probability, reset, with delay
  useEffect(() => {
    if (!autoReplay) return;
    if (state.step === 'choose') {
      chooseDoor(Math.floor(Math.random() * numDoors));
      return;
    }
    if (state.step === 'switch') {
      const p = typeof autoSwitchProb === 'number' ? Math.max(0, Math.min(100, autoSwitchProb)) / 100 : 1;
      onSwitch(Math.random() < p);
      return;
    }
    if (state.step === 'result') {
      autoTimer.current = window.setTimeout(() => {
        reset();
      }, typeof replaySpeedMs === 'number' ? replaySpeedMs : 500);
      return;
    }
  }, [autoReplay, state.step, numDoors, autoSwitchProb, replaySpeedMs]);
  useEffect(() => () => { if (autoTimer.current) window.clearTimeout(autoTimer.current); }, []);

  return (
    <Stack gap="lg">
  <Title order={3}>Interactive Mode</Title>
  <Text c="dimmed" size="sm">Pick a door. The host reveals a goat behind another door. Decide whether to switch. See how your outcomes change over time.</Text>
      <Group justify="center" gap="md" wrap="wrap">
        {Array.from({ length: numDoors }, (_, i) => (
          <DoorCard
            key={i}
            index={i}
            status={doorStatuses[i]}
            showPrize={state.step === 'result'}
            hasPrize={state.step === 'result' ? state.prizeDoors.has(i) : undefined}
            isInitial={state.step === 'result' ? state.initialDoor === i : undefined}
            isFinal={state.step === 'result' ? state.selectedDoor === i : undefined}
            onClick={() => state.step === 'choose' && chooseDoor(i)}
          />
        ))}
      </Group>

      <Card withBorder  p="md">
        <Stack gap="sm">
          <Text>
            {state.step === 'choose' && 'Choose a door'}
            {state.step === 'switch' && `Host revealed ${numReveals} losing door(s). Do you want to switch to a different closed door?`}
            {state.step === 'result' && (state.lastWin ? 'You won!' : 'You lost this round.')}
          </Text>
          <Stack gap="sm" style={{ minHeight: 80 }}>
            {state.step === 'switch' && (
              <Group>
                <Button leftSection={<IconArrowsExchange size={16} />} color="violet" onClick={() => onSwitch(true)}>Switch</Button>
                <Button variant="light" leftSection={<IconPlayerPlay size={16} />} color="violet" onClick={() => onSwitch(false)}>Stay</Button>
              </Group>
            )}
            {state.step === 'result' && (
              <Group>
                <Button leftSection={<IconRotate size={16} />} color="violet" onClick={reset}>Play again</Button>
                {state.decidedSwitch != null && (
                  <Badge color={state.decidedSwitch ? 'violet' : 'gray'} variant="light">
                    Decision: {state.decidedSwitch ? 'switched' : 'stayed'}
                  </Badge>
                )}
              </Group>
            )}
          </Stack>
          <Group>
            <Button variant="light" color="violet" leftSection={<IconPlayerTrackPrev size={16} />} onClick={stepPrev}>Previous</Button>
            <Button variant="light" color="violet" leftSection={<IconPlayerTrackNext size={16} />} onClick={stepNext}>Next</Button>
            <Button variant={autoReplay ? 'filled' : 'light'} color="violet" leftSection={autoReplay ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />} onClick={() => setAutoReplay((v) => !v)}>
              {autoReplay ? 'Pause' : 'Play'}
            </Button>
            <Button variant="light" color="red" leftSection={<IconPlayerPause size={16} />} onClick={() => setAutoReplay(false)}>Stop</Button>
            <Button variant="light" color="violet" leftSection={<IconRotate size={16} />} onClick={resetReplay}>Reset</Button>
            <NumberInput label="Speed (ms)" value={replaySpeedMs} min={100} max={5000} step={100} onChange={(v) => typeof v === 'number' ? setReplaySpeedMs(v) : setReplaySpeedMs('')} />
            <NumberInput label="Auto switch (%)" value={autoSwitchProb} min={0} max={100} step={5} onChange={(v) => typeof v === 'number' ? setAutoSwitchProb(v) : setAutoSwitchProb('')} />
          </Group>
        </Stack>
      </Card>

      <StatsBar />
      <StatsGraphs />
    </Stack>
  );
}

function StatsBar() {
  const { games, switchWins, stayWins, switchPlays, stayPlays } = useResultsStore();
  const { numDoors, numCars, numReveals } = useConfigStore();
  const switchRate = switchPlays ? Math.round((switchWins / switchPlays) * 1000) / 10 : 0;
  const stayRate = stayPlays ? Math.round((stayWins / stayPlays) * 1000) / 10 : 0;
  
  const theorySwitch = Math.round(theoreticalSwitchWinProbability(numDoors, numCars, numReveals) * 1000) / 10;
  const theoryStay = Math.round(theoreticalStayWinProbability(numDoors, numCars) * 1000) / 10;
  
  return (
    <Card withBorder p="md">
      <Stack gap="md">
        <Group justify="space-between" wrap="wrap">
          <Group gap="xl">
            <div>
              <Text size="sm" c="dimmed">Games played</Text>
              <Text size="xl" fw={700}>{games}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">Switch strategy</Text>
              <Group gap="xs">
                <Text size="xl" fw={700} c={(switchPlays || 0) > 0 ? 'violet' : 'dimmed'}>{switchRate}%</Text>
                <Text size="xs" c="dimmed">({switchWins}/{switchPlays})</Text>
              </Group>
              <Text size="xs" c="dimmed">Target: {theorySwitch}%</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">Stay strategy</Text>
              <Group gap="xs">
                <Text size="xl" fw={700} c={(stayPlays || 0) > 0 ? 'gray' : 'dimmed'}>{stayRate}%</Text>
                <Text size="xs" c="dimmed">({stayWins}/{stayPlays})</Text>
              </Group>
              <Text size="xs" c="dimmed">Target: {theoryStay}%</Text>
            </div>
          </Group>
        </Group>
        
        {games > 0 && (
          <Stack gap={4}>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Switch convergence</Text>
              <Text size="sm" c="dimmed">{Math.abs(switchRate - theorySwitch).toFixed(1)}% from target</Text>
            </Group>
            <Progress 
              value={Math.min(100, (1 - Math.abs(switchRate - theorySwitch) / 100) * 100)} 
              color={Math.abs(switchRate - theorySwitch) < 5 ? 'teal' : Math.abs(switchRate - theorySwitch) < 10 ? 'yellow' : 'violet'}
              size="sm"
            />
            <Group justify="space-between">
              <Text size="sm" c="dimmed">Stay convergence</Text>
              <Text size="sm" c="dimmed">{Math.abs(stayRate - theoryStay).toFixed(1)}% from target</Text>
            </Group>
            <Progress 
              value={Math.min(100, (1 - Math.abs(stayRate - theoryStay) / 100) * 100)} 
              color={Math.abs(stayRate - theoryStay) < 5 ? 'teal' : Math.abs(stayRate - theoryStay) < 10 ? 'yellow' : 'gray'}
              size="sm"
            />
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

function StatsGraphs() {
  const { games, switchWins, stayWins, switchPlays, stayPlays, history } = useResultsStore();
  const { numDoors, numCars, numReveals } = useConfigStore();
  
  const switchRate = switchPlays ? Math.round((switchWins / switchPlays) * 1000) / 10 : 0;
  const stayRate = stayPlays ? Math.round((stayWins / stayPlays) * 1000) / 10 : 0;
  
  const theorySwitch = Math.round(theoreticalSwitchWinProbability(numDoors, numCars, numReveals) * 1000) / 10;
  const theoryStay = Math.round(theoreticalStayWinProbability(numDoors, numCars) * 1000) / 10;
  
  const data = [
    { 
      name: 'Switch', 
      empirical: switchRate,
      theoretical: theorySwitch,
      plays: switchPlays || 0,
    },
    { 
      name: 'Stay', 
      empirical: stayRate,
      theoretical: theoryStay,
      plays: stayPlays || 0,
    },
  ];

  if (games === 0) return null;

  return (
    <Stack gap="lg">
      <Group align="center" gap="xs">
        <ThemeIcon color="violet"><IconReportAnalytics size={16} /></ThemeIcon>
        <Title order={3}>Statistics & Insights</Title>
      </Group>
      <Text c="dimmed" size="sm">
        Live empirical win rates from your plays compared to theoretical predictions for N={numDoors}, M={numCars}, K={numReveals}.
      </Text>
      
      <Card withBorder p="md">
        <Group justify="space-between" mb="md">
          <div>
            <Text fw={600} mb={4}>Empirical vs Theoretical Win Rates</Text>
            <Text size="sm" c="dimmed">
              Theoretical targets: Switch {theorySwitch}% • Stay {theoryStay}%
            </Text>
          </div>
          <Group gap="xs">
            <ThemeIcon size="sm" color="violet" variant="light"><div style={{ width: 8, height: 8, backgroundColor: '#8b5cf6', borderRadius: 2 }} /></ThemeIcon>
            <Text size="xs" c="dimmed">Empirical</Text>
            <ThemeIcon size="sm" color="gray" variant="light"><div style={{ width: 8, height: 8, border: '2px dashed #666', borderRadius: 2 }} /></ThemeIcon>
            <Text size="xs" c="dimmed">Theoretical</Text>
          </Group>
        </Group>
        <div style={{ width: '100%', height: 300, minWidth: 320, minHeight: 220 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis unit="%" domain={[0, 100]} />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => {
                  if (name === 'empirical') {
                    return [`${value}% (${props.payload.plays} plays)`, 'Empirical'];
                  }
                  return [`${value}%`, 'Theoretical'];
                }}
              />
              <ReferenceLine y={50} stroke="#666" strokeDasharray="3 3" strokeOpacity={0.3} />
              <Bar dataKey="empirical" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === 'Switch' ? '#8b5cf6' : '#9ca3af'}
                    opacity={entry.plays > 0 ? 1 : 0.3}
                  />
                ))}
              </Bar>
              <Bar dataKey="theoretical" fill="transparent" stroke="#666" strokeWidth={2} strokeDasharray="4 4" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Group mt="sm" gap="xs" justify="center">
          <ThemeIcon color="violet" variant="light"><IconTrendingUp size={16} /></ThemeIcon>
          <Text c="dimmed" size="sm">
            As games increase, empirical rates converge toward theoretical targets
          </Text>
        </Group>
      </Card>

      {history && history.length > 1 && (
        <ConvergenceChart
          history={history}
          theorySwitch={theoreticalSwitchWinProbability(numDoors, numCars, numReveals)}
          theoryStay={theoreticalStayWinProbability(numDoors, numCars)}
          title="Live Convergence Analysis"
        />
      )}

      <Card withBorder p="md">
        <Title order={4}>Understanding the Results</Title>
        <Text mt="xs">
          Your empirical win rates show real outcomes from your plays. Initially, with few games, randomness causes large deviations from theoretical predictions. As you play more rounds, the law of large numbers takes effect—your empirical rates should converge toward the theoretical values. The convergence chart above visualizes this journey, with confidence intervals showing the expected range of variation.
        </Text>
      </Card>
    </Stack>
  );
}
