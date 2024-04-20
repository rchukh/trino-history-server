import {createRootRoute, Outlet} from '@tanstack/react-router'
import {TanStackRouterDevtools} from '@tanstack/router-devtools'
import {Nav} from "@/components/nav.tsx";


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
export const Route = createRootRoute({

    component: () => (
        <>
            <Nav title={'Trino History Server'} links={navLinks}/>
            <Outlet/>
            <TanStackRouterDevtools/>
        </>
    ),
})
