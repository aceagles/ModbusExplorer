import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import ConnectForm from './components/ConnectForm';

export default function App() {
    const [opened, { toggle }] = useDisclosure();

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
            <AppShell.Header>
                <Group justify='space-between'>

                    <Burger
                        opened={!opened}
                        onClick={toggle}
                        size="sm"
                    />
                    <div>Modbus Explorer</div>
                    <div> </div>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <ConnectForm />
            </AppShell.Navbar>

            <AppShell.Main>Main</AppShell.Main>
        </AppShell>
    );
}