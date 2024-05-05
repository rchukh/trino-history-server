import {createRootRoute, Outlet} from '@tanstack/react-router'
import {TanStackRouterDevtools} from '@tanstack/router-devtools'
import {Nav} from "@/components/nav.tsx";
import {styled} from "@mui/material";

const navLinks = [
    {
        title: 'History',
        href: '/'
    },
    {
        title: 'Overview',
        href: '/overview'
    }
];

const Offset = styled('div')(({theme}) => theme.mixins.toolbar);

export const Route = createRootRoute({

    component: () => (
        <>
            <Nav title={'Trino History Server'} links={navLinks}/>
            <Offset/>
            <Outlet/>
            <TanStackRouterDevtools/>
        </>
    ),
})
