import ReactFlow, {
    addEdge,
    Background,
    Controls,
    Edge,
    MiniMap,
    Node,
    ReactFlowProvider,
    useEdgesState,
    useNodesState, useReactFlow
} from "reactflow";
import {useCallback, useLayoutEffect} from "react";
import 'reactflow/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';


const elk = new ELK();
// See additional Elk options to configure:
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html
const elkOptions = {
    'elk.algorithm': 'layered',
    'elk.direction': 'UP',
    'elk.layered.spacing.nodeNodeBetweenLayers': '50'
};
const elkTopNodesOptions = {
    'elk.algorithm': 'layered',
    'elk.direction': 'UP',
    "elk.padding": "[left=20, top=50, right=20, bottom=20]",
}

function toElkNode(node) {
    return node.map((element) => ({
        id: element.id,
        data: element.data,
        width: 100,
        height: 50,
        layoutOptions: {
            // "elk.direction": "UP",
            // "elk.padding": "[left=20, top=100, right=20, bottom=0]",
            // 'elk.nodeLabels.placement': 'OUTSIDE V_CENTER H_CENTER'
        },
        children: element.children?.map((data) => {
            toElkNode(data)
        })
    }))
}

function mapElkChildren(result: Node[], node) {
    node.children?.forEach((child) => {
        result.push({
            id: child.id,
            position: {x: child.x, y: child.y},
            data: child.data,
            style: {width: child.width, height: child.height},
            parentId: node.id,
            sourcePosition: 'top',
            targetPosition: 'bottom',
        })

        mapElkChildren(result, child)
    })
}

function fromElk(rootNode): Node[] {
    let result: Node[] = []
    Object
        .entries(rootNode)
        .forEach(([key, topNode]) => {
                result.push({
                    id: topNode.id,
                    position: {x: topNode.x, y: topNode.y},
                    data: topNode.data,
                    sourcePosition: 'top',
                    targetPosition: 'bottom',
                    style: {
                        width: topNode.width,
                        height: topNode.height,
                        backgroundColor: 'rgba(255, 0, 0, 0.2)'
                    }
                });
                mapElkChildren(result, topNode)
            }
        )
    return result;
}

const getLayoutedElements = (nodes, edges) => {
    // Convert to ELK input
    const graph = {
        id: 'root',
        layoutOptions: elkOptions,
        children: nodes.map((group) => ({
            id: group.id,
            data: group.data,
            layoutOptions: elkTopNodesOptions,
            children: toElkNode(group.children)
        })),
        // edges: edges,
        edges: edges.map((edge) => ({
            id: edge.id,
            sources: [edge.source],
            targets: [edge.target]
        }))
    };
    // console.log(graph)

    return elk
        // Apply ELK layout
        .layout(graph)
        // Convert back to XYFlow types
        .then((layoutedGraph) => ({
            nodes: fromElk(layoutedGraph.children),
            edges: layoutedGraph.edges?.map((edge: any) => ({
                id: edge.id,
                source: edge.sources[0],
                target: edge.targets[0],
                type: 'default',
                animated: true
            }))
        }))
        .catch(console.error);
};


// TODO: Parse the node information on the backend
interface QueryNodeOutput {
    type: string,
    name: string,
}

interface QueryNodeEstimates {
    outputRowCount: number;
    outputSizeInBytes: number;
    cpuCost: number;
    memoryCost: number;
    networkCost: number;
}

interface QueryNode {
    id: string;
    name: string;
    // TODO: Type-specific descriptor
    descriptor: any;
    outputs: QueryNodeOutput[];
    details: string[];
    estimates: QueryNodeEstimates[];
    children: QueryNode[];
}

// Linked children
function mapChildren(edges: Edge[], elements: QueryNode[], parentId?: string): PlanNode[] {
    let nodes: PlanNode[] = []
    elements.forEach((element) => {
        let sourceFragmentIds = element.descriptor['sourceFragmentIds'];
        if (sourceFragmentIds) {
            let remoteSources = sourceFragmentIds.replace('[', '').replace(']', '').split(', ') as string[];
            if (remoteSources.length > 0) {
                remoteSources.forEach(sourceId => {
                        edges.push(
                            {
                                id: `${element.id}-${sourceId}`,
                                source: sourceId,
                                target: element.id
                            },
                        )
                    }
                )
            }
        }
        let elementChildren = mapChildren(edges, element.children, element.id)
        if (parentId) {
            edges.push(
                {
                    id: `${parentId}-${element.id}`,
                    source: element.id,
                    target: parentId,
                },
            )
        }
        elementChildren.forEach((child) => {
            nodes.push(child)
        })
        nodes.push({
            id: element.id,
            data: {label: element.name}
        })
    });
    return nodes;
}

// Nested children
// function mapChildren(edges: Edge[], elements: QueryNode[]): PlanNode[] {
//     return elements.map((element): PlanNode => {
//         let sourceFragmentIds = element.descriptor['sourceFragmentIds'];
//         if (sourceFragmentIds) {
//             let remoteSources = sourceFragmentIds.replace('[', '').replace(']', '').split(', ') as string[];
//             if (remoteSources.length > 0) {
//                 remoteSources.forEach(sourceId => {
//                         edges.push(
//                             {
//                                 id: `${sourceId}-${element.id}`,
//                                 source: sourceId,
//                                 target: element.id
//                             },
//                         )
//                     }
//                 )
//             }
//         }
//         let elementChildren = mapChildren(edges, element.children)
//
//         return {
//             id: element.id,
//             // type: 'input',
//             data: {
//                 label: element.name
//             },
//             // position: position,
//             className: 'light',
//             children: elementChildren
//         }
//     });
// }

interface PlanNode {
    id: string,
    data: {
        label: string
    },
    className?: string,
    children?: PlanNode[]
}

function LayoutFlow({jsonPlan}: { jsonPlan: string }) {
    let plan = JSON.parse(jsonPlan)
    // console.log(plan)
    let rawNodes: PlanNode[] = [];
    let rawEdges: Edge[] = [];
    Object
        .entries(plan)
        .forEach(
            ([key, value]) => {
                let typedNode = value as QueryNode
                let children = mapChildren(rawEdges, typedNode.children)
                rawNodes.push(
                    {
                        id: key,
                        // type: 'input',
                        data: {
                            label: typedNode.name
                        },
                        // position: position,
                        className: 'light',
                        // style: {backgroundColor: 'rgba(255, 0, 0, 0.2)'},
                        children: children
                    }
                )
            }
        );

    // TODO: Connect parent groups on sourceFragmentIds
    //       There may be issues with multi-source queries...
    // NOTE: Without this the graph is not rendered with a proper direction.
    rawEdges.push({id: `1-0`, source: "1", target: "0"})
    rawEdges.push({id: `2-1`, source: "2", target: "1"})

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const {fitView} = useReactFlow();
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);
    const onLayout = useCallback(
        ({useInitialNodes = true}) => {
            const ns = useInitialNodes ? rawNodes : nodes;
            const es = useInitialNodes ? rawEdges : edges;

            getLayoutedElements(ns, es).then((graph) => {
                console.log(graph)
                if (graph) {
                    setNodes(graph.nodes);
                    setEdges(graph.edges);
                }
                window.requestAnimationFrame(() => fitView());
            });
        },
        [nodes, edges]
    );

    // Calculate the initial layout on mount.
    useLayoutEffect(() => {
        onLayout({useInitialNodes: true});
    }, []);

    return (
        <div style={{width: '95vw', height: '90vh'}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                // nodesDraggable={false}
                nodesConnectable={false}
                fitView
            >
                <MiniMap/>
                <Controls/>
                <Background/>
            </ReactFlow>
        </div>
    )
}

export default function QueryPlanGraph({jsonPlan}: { jsonPlan: string }) {
    return (
        <ReactFlowProvider>
            <LayoutFlow jsonPlan={jsonPlan}/>
        </ReactFlowProvider>
    )
}