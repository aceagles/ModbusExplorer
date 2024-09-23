import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import ConnectForm from './components/ConnectForm';
import ReadsView from './components/ReadsView';
import { EventsOn } from '../wailsjs/runtime'
import { useEffect, useState } from 'react';

export default function App() {
    const [opened, { toggle }] = useDisclosure();
    const [isConnected, setIsConnected] = useState<boolean>(false)
    useEffect(() => EventsOn("setConnected", (isCon: boolean) => setIsConnected(isCon)), [])

    return (
        <AppShell
            header={{ height: 30 }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: { mobile: !opened, desktop: opened },

            }}
            padding="md"
        >
            <AppShell.Header style={{ background: isConnected ? 'var(--mantine-color-green-5)' : 'white' }}>
                <Group justify='space-between'>

                    <Burger
                        onClick={toggle}
                        size="sm"
                    />
                    <div>Modbus Explorer</div>
                    <div></div>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <ConnectForm connected={isConnected} />
            </AppShell.Navbar>

            <AppShell.Main>
                <ReadsView />
            </AppShell.Main>
        </AppShell>
    );
}