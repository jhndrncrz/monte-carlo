import { useState } from 'react';
import {
  AppShell,
  Group,
  Title,
  ActionIcon,
  Tabs,
  Container,
  Text,
} from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun, IconDeviceGamepad2, IconHandClick, IconChartHistogram, IconSettings } from '@tabler/icons-react';
import PlayMode from './components/PlayMode';
import SimulationMode from './components/SimulationMode';
import { ErrorBoundary } from './components/ErrorBoundary';
import IntroHero from './components/IntroHero';
import ConfigPanel from './components/ConfigPanel';

export default function App() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [tab, setTab] = useState<string | null>('play');

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md">
          <Group>
            <IconDeviceGamepad2 size={22} stroke={1.7} />
            <Title order={3}>Monty Hall Simulator</Title>
          </Group>
          <Group gap="xs">
            <Text size="sm" c="dimmed">Theme</Text>
            <ActionIcon
              variant="light"
              color="violet"
              
              size="lg"
              onClick={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="lg">
          <IntroHero />
          <ErrorBoundary>
          <Tabs value={tab} onChange={setTab} variant="pills" color="violet" radius="xl" keepMounted={false}>
            <Tabs.List grow>
              <Tabs.Tab value="config" leftSection={<IconSettings size={16} />}>Configuration</Tabs.Tab>
              <Tabs.Tab value="play" leftSection={<IconHandClick size={16} />}>Play Mode</Tabs.Tab>
              <Tabs.Tab value="simulate" leftSection={<IconChartHistogram size={16} />}>Simulation</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="config" pt="md">
              <ConfigPanel />
            </Tabs.Panel>
            <Tabs.Panel value="play" pt="md">
              <PlayMode />
            </Tabs.Panel>
            <Tabs.Panel value="simulate" pt="md">
              <SimulationMode />
            </Tabs.Panel>
          </Tabs>
          </ErrorBoundary>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
