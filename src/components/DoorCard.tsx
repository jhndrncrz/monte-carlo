import { Badge, Card, Center, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconCar, IconX } from '@tabler/icons-react';

interface DoorCardProps {
  index: number;
  status: 'closed' | 'revealed' | 'selected' | 'final';
  showPrize?: boolean;
  prizeDoor?: number; // legacy single-car support
  hasPrize?: boolean; // generalized support
  onClick?: () => void;
  isInitial?: boolean;
  isFinal?: boolean;
}

export default function DoorCard({ index, status, showPrize, prizeDoor, hasPrize, onClick, isInitial, isFinal }: DoorCardProps) {
  const isOpen = status === 'revealed' || status === 'final';
  const isSelected = status === 'selected';
  const hasCar = !!showPrize && (hasPrize === true || prizeDoor === index);

  return (
    <Card
      component={motion.div}
      whileHover={{ scale: isOpen ? 1 : 1.03 }}
      whileTap={{ scale: isOpen ? 1 : 0.98 }}
      withBorder
      shadow={isSelected ? 'lg' : 'sm'}
      
      onClick={onClick}
      style={{
        cursor: onClick && !isOpen ? 'pointer' : 'default',
        width: 160,
        height: 240,
        background: isOpen ? 'linear-gradient(180deg, rgba(147,51,234,0.1), rgba(147,51,234,0.05))' : undefined,
        borderColor: isSelected ? 'var(--mantine-color-violet-5)' : undefined,
      }}
    >
      <Center h="100%">
        {isOpen ? (
          <Stack gap={4} align="center">
            <Group gap="xs">
              <ThemeIcon size="lg"  color={hasCar ? 'teal' : 'red'}>
                {hasCar ? <IconCar size={18} /> : <IconX size={18} />}
              </ThemeIcon>
              <Text fw={700} size="lg" c={hasCar ? 'teal.5' : 'red.6'}>
                {hasCar ? 'Car' : 'Goat'}
              </Text>
            </Group>
            {(status === 'final') && (
              <Group gap={6}>
                {isInitial && <Badge color="gray" variant="light" size="sm">original</Badge>}
                {isFinal && <Badge color="violet" variant="light" size="sm">final</Badge>}
              </Group>
            )}
          </Stack>
        ) : (
          <Text fw={700} size="xl">Door {index + 1}</Text>
        )}
      </Center>
    </Card>
  );
}
