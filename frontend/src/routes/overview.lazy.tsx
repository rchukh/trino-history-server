import Box from '@mui/material/Box'
import { createLazyFileRoute } from '@tanstack/react-router'
import {Alert} from "@mui/material";

export const Route = createLazyFileRoute('/overview')({
    component: Overview,
})

function Overview() {
    return <Box>
        <Alert severity="warning">TODO</Alert>
    </Box>
}
