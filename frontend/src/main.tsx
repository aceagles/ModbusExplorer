import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import App from './App'
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
    /** Put your mantine theme override here */
});

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <MantineProvider theme={theme}>
            <Notifications />
            <App />
        </MantineProvider>
    </React.StrictMode>
)
