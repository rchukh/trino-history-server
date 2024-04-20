import {createLazyFileRoute} from '@tanstack/react-router'
import QueryPlanGraph from "@/components/queryPlanGraph.tsx";

export const Route = createLazyFileRoute('/query/details')({
    component: QueryDetails,
})

function QueryDetails()
{
    return (
        <QueryPlanGraph/>
    )
}
