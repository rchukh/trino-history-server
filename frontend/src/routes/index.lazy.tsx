import {createLazyFileRoute, Link} from '@tanstack/react-router'
import {IconButton, Tooltip} from "@mui/material";
import {useMemo, useState} from "react";
import {MaterialReactTable, type MRT_ColumnDef, type MRT_ColumnFiltersState, type MRT_PaginationState, type MRT_SortingState, useMaterialReactTable,} from 'material-react-table';
import RefreshIcon from '@mui/icons-material/Refresh';
import {keepPreviousData, useQuery,} from '@tanstack/react-query';

export const Route = createLazyFileRoute('/')({
    component: History,
})

type HistoryResults = {
    data: Array<QueryEvent>;
    metadata: TableMetadata;
};

type QueryEvent = {
    id: string;
    queryId: string;
    serverVersion: string;
    user: string;
    source: string;
};

type TableMetadata = {
    totalRowCount: number;
}

interface EventListProps
{
    server_base?: string
}

const EventList = ({server_base}: EventListProps) => {
    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const [pagination, setPagination] = useState<MRT_PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const {
        data: {
            data = [],
            metadata
        } = {},
        isError,
        isRefetching,
        isLoading,
        refetch,
    } = useQuery<HistoryResults>({
        queryKey: [
            'table-data',
            columnFilters,           // refetch when columnFilters changes
            globalFilter,            // refetch when globalFilter changes
            pagination.pageIndex,    // refetch when pagination.pageIndex changes
            pagination.pageSize,     // refetch when pagination.pageSize changes
            sorting,                 // refetch when sorting changes
        ],
        queryFn: async () => {
            const fetchURL = new URL('/api/queries', server_base);
            fetchURL.searchParams.set('offset', `${pagination.pageIndex * pagination.pageSize}`);
            fetchURL.searchParams.set('limit', `${pagination.pageSize}`);
            fetchURL.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
            fetchURL.searchParams.set('globalFilter', globalFilter ?? '');
            fetchURL.searchParams.set('sorting', JSON.stringify(sorting ?? []));

            const response = await fetch(fetchURL.href);
            return (await response.json()) as HistoryResults;
        },
        placeholderData: keepPreviousData, // do not go to 0 rows when refetching or paginating to next page
    });

    const columns = useMemo<MRT_ColumnDef<QueryEvent>[]>(
        // Column definitions...
        () => [
            {
                accessorKey: 'id',
                header: 'Id',
                Cell: ({renderedCellValue, row}) => (
                    <Link to="/query/details/$id" params={(prev) => ({ ...prev, id: row.getValue("id") })}>
                        {renderedCellValue}
                    </Link>
                ),
            },
            {
                accessorKey: 'queryId',
                header: 'Query Id',
            },
            {
                accessorKey: 'serverVersion',
                header: 'Server Version',
            },
            {
                accessorKey: 'user',
                header: 'User',
            },
            {
                accessorKey: 'source',
                header: 'Source',
            }
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data,
        initialState: {showColumnFilters: true},
        manualFiltering: true,  // turn off built-in client-side filtering
        manualPagination: true, // turn off built-in client-side pagination
        manualSorting: true,    // turn off built-in client-side sorting
        muiToolbarAlertBannerProps: isError
            ? {
                color: 'error',
                children: 'Error loading data',
            }
            : undefined,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        renderTopToolbarCustomActions: () => (
            <Tooltip arrow title="Refresh Data">
                <IconButton onClick={() => refetch()}>
                    <RefreshIcon/>
                </IconButton>
            </Tooltip>
        ),
        rowCount: metadata?.totalRowCount ?? 0,
        state: {
            columnFilters,
            globalFilter,
            isLoading,
            pagination,
            showAlertBanner: isError,
            showProgressBars: isRefetching,
            sorting,
        },
    });
    return <MaterialReactTable table={table}/>;
};

function History()
{
    return (
        <EventList server_base={import.meta.env.VITE_HISTORY_SERVER_BASE}/>
    )
}
