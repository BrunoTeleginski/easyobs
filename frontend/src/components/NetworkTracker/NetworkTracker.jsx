import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge, Background, updateEdge } from 'reactflow';
import IpNodeType from './CustomNode/IpNodeType'
import axiosApi from '../../lib/axiosApi';
import LayoutHelper from './LayoutHelper'
import eventHandler from '../../lib/eventHandler';

import 'reactflow/dist/style.css';


const nodeTypes = { ip: IpNodeType };
const edgeOptions = {
    animated: true,
    style: {
        stroke: 'black',
    },
};
const initialNodes = []
const initialEdges = []

export default function NetworkTracker() {

    const isMounted = useRef(false)
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
    const [podsList, setPodList] = useState([])

    //call only once
    useEffect(() => {
        if (!isMounted.current){

            getPodNetworkData("nginx-b875c6858-kwztn")
            eventPodNetwork("nginx-b875c6858-kwztn")
            loadPodList()

            isMounted.current=true

        }
    },[]);
      

    async function getPodNetworkData(podName){

        let res = await axiosApi.get("/network/"+podName)
        if(res.status != 200){
            return
        }
    
        let flow = LayoutHelper.GetInstance().TransformDataToNodesConnection(podName, res.data.data)
    
        
        setNodes(flow.nodes)
        setEdges(flow.edges)
    }

    /**Load all pods names */
    function loadPodList(){
        axiosApi.get("/kubernetes/pods").then((res)=>{
            if(res.status == 200){
                setPodList(res.data)
            }
        })
    }

    /** Connect on backend using keep alive connection in order to receive updated data */
    function eventPodNetwork(pod) {
        eventHandler.getClass("/network/event/"+pod).connect("networktracker", (event)=>{

            let updatedFlow = LayoutHelper.GetInstance().UpdateNodes(JSON.parse(event.data).data)
            
            //only update the nodes data
            setNodes((nds) =>
                nds.map((node) => {

                    let nodeIndex = updatedFlow.ref[node.id]

                    if (nodeIndex >= 0) {
                        node.data = {
                            ...updatedFlow.nodes[nodeIndex].data,
                        };
                        node.position = updatedFlow.nodes[nodeIndex].position
                    }

                    return node;
                })
            );
            
            // //add new nodes
            setNodes((nds)=> {
                updatedFlow.newNodesIndexRef.map((index) => {
                    nds.push(updatedFlow.nodes[index])
                })

                return nds
            })
            
            //add new connections
            setEdges((eds) => {
                updatedFlow.newEdgeIndexRef.map((indexEdge)=> {
                    addEdge(updatedFlow.edges[indexEdge], eds)
                })            
                return eds
            })
        })
    }

    function onchangePodName(podName){

        eventHandler.close()
        setNodes([])
        setEdges([])
        LayoutHelper.GetInstance().Clean()
        
        getPodNetworkData(podName)
        eventPodNetwork(podName)
    }

    //necessary for the edges upgrade
    const edgesWithUpdated = edges.map((edge) => {
        return edge;
    });
    const nodesWithUpdated = nodes.map((node) => {
        return node;
    });


    return (
        <>
            <div className="flex flex-row p-5">
                <div className="basis-1/4 px-2">
                    <label htmlFor="pods" className="block mb-2 text-sm font-medium text-gray-900">
                        Pod
                    </label>
                    <select 
                        id="pods" 
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        onChange={(e) => onchangePodName(e.target.value)}
                    >
                        <option defaultValue></option>

                        {Object.values(podsList).map(pod => {
                            return(<option key={pod} value={pod}>{pod}</option>)
                        })}
                        
                    </select>
                </div>
            </div>

            <ReactFlow
                nodes={nodesWithUpdated}
                edges={edgesWithUpdated}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={edgeOptions}
                style={{
                    backgroundColor: '#FFFFF',
                }}
            >

            {/* <Background variant="dots" gap={12} size={1} /> */}

            </ReactFlow>
        </>
    );
}