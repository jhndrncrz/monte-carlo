import { Card, Grid, Group, List, NumberInput, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconDoor, IconCar, IconEye, IconMathFunction } from '@tabler/icons-react';
import { useConfigStore } from '../store/configStore';
import { theoreticalStayWinProbability, theoreticalSwitchWinProbability } from '../utils/probability';

export default function ConfigPanel() {
  const { numDoors, numCars, numReveals, set } = useConfigStore();
  const theorySwitch = Math.round(theoreticalSwitchWinProbability(numDoors, numCars, numReveals) * 1000) / 10;
  const theoryStay = Math.round(theoreticalStayWinProbability(numDoors, numCars) * 1000) / 10;

  return (
    <Stack gap="lg">
      <Title order={3}>Configuration</Title>
      <Text c="dimmed" size="sm">Tune the parameters below. These affect both Play Mode and Simulation Mode.</Text>
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="xl" p="md">
            <Stack>
              <Group wrap="wrap" gap="md">
                <NumberInput label="Doors (N)" value={numDoors} min={3} max={50} step={1} onChange={(v) => typeof v === 'number' && set({ numDoors: v })} />
                <NumberInput label="Cars (M)" value={numCars} min={1} max={Math.max(1, numDoors - 1)} step={1} onChange={(v) => typeof v === 'number' && set({ numCars: v })} />
                <NumberInput label="Reveals (K)" value={numReveals} min={1} max={Math.max(1, numDoors - 2)} step={1} onChange={(v) => typeof v === 'number' && set({ numReveals: v })} />
              </Group>
              <List spacing="xs" size="sm" icon={<ThemeIcon color="violet" radius="xl" size={20} />}>
                <List.Item icon={<ThemeIcon color="violet" radius="xl"><IconDoor size={14} /></ThemeIcon>}>
                  <Text><strong>Doors (N)</strong>: total number of doors in the game.</Text>
                </List.Item>
                <List.Item icon={<ThemeIcon color="violet" radius="xl"><IconCar size={14} /></ThemeIcon>}>
                  <Text><strong>Cars (M)</strong>: how many winning doors exist. The rest hide goats.</Text>
                </List.Item>
                <List.Item icon={<ThemeIcon color="violet" radius="xl"><IconEye size={14} /></ThemeIcon>}>
                  <Text><strong>Reveals (K)</strong>: how many losing doors the host opens after your initial pick (never reveals a car or your chosen door).</Text>
                </List.Item>
              </List>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="xl" p="md">
            <Group>
              <ThemeIcon color="violet" radius="xl"><IconMathFunction size={16} /></ThemeIcon>
              <Title order={4}>Expected probabilities</Title>
            </Group>
            <Stack gap={4} mt="sm">
              <Text>Staying (no switch): <strong>{theoryStay}%</strong></Text>
              <Text>Switching (uniform to any closed door): <strong>{theorySwitch}%</strong></Text>
              <Text c="dimmed" size="sm">
                Expected win rates are computed from probability formulas, not simulation. “Staying” is the chance your initial pick is a car (M/N). “Switching” assumes you always switch uniformly to one of the remaining closed doors after the host reveals K goats. These values change as you edit N, M, K.
              </Text>
              <Text c="dimmed" size="sm">Configuration: N={numDoors}, M={numCars}, K={numReveals}</Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
