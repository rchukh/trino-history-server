import React from 'react'
import ReactDOM from 'react-dom/client'
import {createRouter, RouterProvider} from '@tanstack/react-router'
import {ThemeProvider} from '@emotion/react';
import {createTheme, CssBaseline} from '@mui/material';
import {routeTree} from './routeTree.gen'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"


const theme = createTheme();
const router = createRouter({routeTree})
const queryClient = new QueryClient();
declare module '@tanstack/react-router'
{
    interface Register
    {
        router: typeof router
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <CssBaseline/>
                <QueryClientProvider client={queryClient}>
                    <RouterProvider router={router}/>
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </LocalizationProvider>
        </ThemeProvider>
    </React.StrictMode>,
)
