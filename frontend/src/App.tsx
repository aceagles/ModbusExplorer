import { Title, Tooltip, AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import ConnectForm from './components/ConnectForm';
import ReadsView from './components/ReadsView';
import { EventsOn } from '../wailsjs/runtime'
import { useEffect, useState } from 'react';
import { IconCircle, IconCircleFilled } from '@tabler/icons-react';

export default function App() {
    const [opened, { toggle }] = useDisclosure();
    const [isConnected, setIsConnected] = useState<boolean>(false)
    useEffect(() => EventsOn("setConnected", (isCon: boolean) => setIsConnected(isCon)), [])

    return (
        <AppShell
            header={{ height: 40 }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: { mobile: !opened, desktop: opened },

            }}
            padding="md"
        >
            <AppShell.Header >
                <Group justify='space-between'>

                    <Burger
                        onClick={toggle}
                        size="sm"
                    />
                    <Title order={3}>Modbus Explorer</Title>
                    <div>
                        {isConnected ?
                            <Tooltip label="Connected">
                                <IconCircleFilled color='green' size={"35px"} />
                            </Tooltip>
                            :
                            <Tooltip label="Disconnected">
                                <IconCircle size={"35px"} />
                            </Tooltip>
                        }
                    </div>
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