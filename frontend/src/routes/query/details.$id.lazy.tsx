import {createLazyFileRoute} from '@tanstack/react-router'
// import QueryPlanGraph from "@/components/queryPlanGraph.tsx";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import {
    CircularProgress,
    Container,
    Grid,
    Paper,
    Stack,
    Step,
    StepLabel,
    Stepper,
    Table, TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography
} from "@mui/material";
import hljs from 'highlight.js/lib/core';
import sql from 'highlight.js/lib/languages/sql';
import "highlight.js/styles/github.min.css";
import QueryPlanGraph from "@/components/queryPlanGraph.tsx";


export const Route = createLazyFileRoute('/query/details/$id')({
    component: QueryDetails,
})

function QueryDetails() {
    // TODO: Centralize
    axios.defaults.baseURL = import.meta.env.VITE_HISTORY_SERVER_BASE;
    hljs.registerLanguage('sql', sql);

    const {id} = Route.useParams()

    const {isPending, error, data, isFetching} = useQuery({
        queryKey: ['queryDetails', id],
        queryFn: () =>
            axios
                .get(`api/query/details?id=${id}`)
                .then((res) => res.data),
    })

    if (isPending) {
        return (
            <Stack direction="row" justifyContent="center" alignItems="center">
                <CircularProgress/>
            </Stack>
        )
    }
    if (error) {
        return (
            <Stack direction="row" justifyContent="center" alignItems="center">
                An error has occurred: ${error.message}
            </Stack>
        )
    }

    const queryData = hljs.highlight(data.query, {language: 'sql'}).value;

    return (
        <Container maxWidth="false">
            {isFetching ? 'Updating...' : ''}

            <Grid container spacing={5}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">

                {/*<Grid item xs={12}>*/}
                {/*    <Paper sx={{ p: 2, textAlign: "center" }}>*/}
                {/*        <Typography variant="h4">Page Header</Typography>*/}
                {/*    </Paper>*/}
                {/*</Grid>*/}

                <Grid item xs={12}>
                    <Stepper activeStep={3}>
                        <Step key='createTime'>
                            <StepLabel optional={(<Typography variant="caption">{data.createTime}</Typography>)}>
                                Created
                            </StepLabel>
                        </Step>
                        <Step key='executionStartTime'>
                            <StepLabel
                                optional={(<Typography variant="caption">{data.executionStartTime}</Typography>)}>
                                Started
                            </StepLabel>
                        </Step>
                        <Step key='endTime'>
                            <StepLabel optional={(<Typography variant="caption">{data.endTime}</Typography>)}>
                                Ended
                            </StepLabel>
                        </Step>
                    </Stepper>
                </Grid>

                <Grid item xs={6} sm={6} md={6} lg={6}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell variant="head">ID</TableCell>
                                    <TableCell>{data.id}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell variant="head">Query ID</TableCell>
                                    <TableCell>{data.queryId}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell variant="head">Server Version</TableCell>
                                    <TableCell>{data.serverVersion}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell variant="head">User</TableCell>
                                    <TableCell>{data.user}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell variant="head">Source</TableCell>
                                    <TableCell>{data.source}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell variant="head">Execution Time</TableCell>
                                    <TableCell>{data.executionTimeMs} ms</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{p: 2}}>
                        <pre>
                            <code className="language-sql" dangerouslySetInnerHTML={{__html: queryData}}/>
                        </pre>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{p: 2}}>
                        <QueryPlanGraph jsonPlan={data.jsonPlan}/>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    )
}
