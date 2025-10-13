import { Card, Grid, Group, List, rem, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconInfoCircle, IconListNumbers, IconMathFunction, IconReportAnalytics } from '@tabler/icons-react';
import { motion } from 'framer-motion';

export default function IntroHero() {
    return (
        <Card
            component={motion.div}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            withBorder

            p="lg"
            mb="lg"
            style={{
                background: 'linear-gradient(180deg, rgba(124,58,237,0.08), rgba(124,58,237,0.03))',
            }}
        >
            <Stack gap="xs">
                <Group>
                    <ThemeIcon color="violet" size={36} >
                        <IconInfoCircle size={18} />
                    </ThemeIcon>
                    <Title order={3} style={{ lineHeight: 1.1 }}>What is the Monty Hall problem?</Title>
                </Group>
                <Text>
                    You face several doors. Some hide prizes (cars), the rest hide goats. You choose a door. The host, who knows where the prizes are, opens a number of other doors to reveal goats. You can now switch to one of the remaining closed doors—or stay with your original choice. Which strategy wins more often depends on the configuration (number of doors, prizes, and reveals).
                </Text>
                <Group gap="sm" align="flex-start">
                    <Stack flex={1}>
                        <Group>
                        <ThemeIcon color="violet" ><IconListNumbers size={16} /></ThemeIcon>
                        <Text fw={600}>How to use this app</Text>
                    </Group>
                    <List withPadding size="sm" icon={<ThemeIcon color="violet" size={20} />}
                        spacing={4}
                        styles={{ itemWrapper: { alignItems: 'center' } }}
                    >
                        <List.Item icon={<IconListNumbers size={16} />}>
                            <Text component="span" fw={600}>Configuration</Text> <Text>Adjust doors, prizes, and reveals to explore different scenarios.</Text>
                        </List.Item>
                        <List.Item icon={<IconInfoCircle size={16} />}>
                            <Text component="span" fw={600}>Play Mode</Text> <Text>Choose doors and decide whether to switch.</Text>
                        </List.Item>
                        <List.Item icon={<IconReportAnalytics size={16} />}>
                            <Text component="span" fw={600}>Simulation</Text> <Text>Run thousands of auto plays to estimate probabilities.</Text>
                        </List.Item>
                        <List.Item icon={<IconMathFunction size={16} />}>
                            <Text component="span" fw={600}>Stats</Text> <Text>Compare win rates and see convergence toward the theoretical result.</Text>
                        </List.Item>
                    </List>
                    </Stack>
                    
                    <Stack flex={1}>
                        <Group>
                        <ThemeIcon color="violet" ><IconMathFunction size={16} /></ThemeIcon>
                        <Text fw={600}>Why switching can help</Text>
                    </Group>
                    <Text>
                        Intuitively, your initial pick covers only a fraction of the total prizes. When the host removes known goats, the remaining closed doors concentrate more of the probability of containing a prize. Switching often improves your odds by tapping into that remaining probability mass. 
                    </Text>
                    <Text size="sm" c="dimmed">
                        In the classic <strong>3 doors, 1 car, 1 reveal</strong> setup, switching wins about 2/3 of the time. In other setups, the advantage changes—use the Configuration page to explore variations.
                    </Text>
                    </Stack>

                    <Stack flex={1}>
                        <Group>
                        <ThemeIcon color="violet" ><IconReportAnalytics size={16} /></ThemeIcon>
                        <Text fw={600}>Goal</Text>
                    </Group>
                    <Text>Use the simulator to see empirical win rates approach the theoretical values as trials increase.</Text>
                    </Stack>
                </Group>
            </Stack>
        </Card>
    );
}
