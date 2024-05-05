'use client'

import {AppBar, Box, IconButton, Menu, MenuItem, Toolbar} from "@mui/material";
import * as Icon from "@mui/icons-material";
import React from "react";
import {Link} from "@tanstack/react-router";
import {ButtonLink} from "@/components/ButtonLink.tsx";

interface NavLink
{
    href: string;
    title: string
}

export function Nav({title, links}: { title: string, links?: NavLink[] })
{
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };
    return (
        <AppBar position="fixed">
            <Toolbar variant="dense" >
                <Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'none'}}}>
                    <IconButton
                        size="large"
                        aria-label="menu"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleOpenNavMenu}
                        color="inherit"
                    >
                        <Icon.Menu/>
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorElNav}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        open={Boolean(anchorElNav)}
                        onClose={handleCloseNavMenu}
                        sx={{
                            display: {xs: 'block', md: 'none'},
                        }}
                    >
                        {links?.map((navData) => (
                            <MenuItem key={navData.title} onClick={handleCloseNavMenu} component={Link} to={navData.href}>
                                {navData.title}
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>

                <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}}}>
                    {links?.map((navData) => (
                        <ButtonLink
                            key={navData.title}
                            to={navData.href}
                            onClick={handleCloseNavMenu}
                            sx={{color: 'white', display: 'block'}}
                            search={{}}
                        >
                            {navData.title}
                        </ButtonLink>
                    ))}
                </Box>

                <Box sx={{flexGrow: 0}}>
                    {title}
                </Box>
            </Toolbar>
        </AppBar>
    )
}
