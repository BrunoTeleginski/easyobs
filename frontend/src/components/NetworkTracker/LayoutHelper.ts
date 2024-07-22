import Dagre from '@dagrejs/dagre';


export default class LayoutHelper {

    static classRef:LayoutHelper;
    
    //default vales
    defaultNodeSizes = {
        width: 200, 
        height: 100
    }
    ipListLimit = 10;
    groupByObject="process"
    groupByToTitle={
        "dst_port": "Port",
        "process": "Process"
    }

    flowNodes:object = [];
    flowEdges:object = [];
    portToNodeArrayRef:object = {}

    static GetInstance(): LayoutHelper {
        if(this.classRef instanceof LayoutHelper){
            return this.classRef
        }

        this.classRef = new LayoutHelper();
        return this.classRef
    }

    constructor() {}

    private getAutoLayoutedElements(nodes:object, edges:object):object {
        const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

        g.setGraph({ rankdir: "TB" });

        Object(edges).forEach((edge) => g.setEdge(edge.source, edge.target));
        Object(nodes).forEach((node) => {
            g.setNode(node.id, node)
        });

        Dagre.layout(g);

        return {
            nodes: Object(nodes).map((node) => {
                let { x, y } = g.node(node.id);
                
                return { ...node, position: { x, y } };
            }),
            edges,
        };
    }

    private getGroupsIps(data:object):object{
        
        let podDestIp = {}
        for (let index = 1; index <= Object(data).length; index++) {
            
            let jsonData = JSON.parse(data[index-1])

            if (jsonData.dst_port > 32766){
                continue
            }

            //check if port number was already added in array
            if (!(jsonData[this.groupByObject] in podDestIp)){
                podDestIp[jsonData[this.groupByObject]] = []
            }

            if(podDestIp[jsonData[this.groupByObject]].includes(jsonData.dst)){
                continue
            }

            podDestIp[jsonData[this.groupByObject]].push(jsonData.dst)


            // if (index == this.ipListLimit){
            //     break
            // }
        }
        return podDestIp
    }

    Clean(){
        this.flowNodes = [];
        this.flowEdges = [];
        this.portToNodeArrayRef = {}
    }

    TransformDataToNodesConnection(podName:string, data:object): object{
        
        //separate IP destination on port groups
        let podDestIp = this.getGroupsIps(data)

        //adds the POD node
        Object(this.flowNodes).push(
            {
                id: podName, 
                data: { 
                    label: podName
                }
            }
        )

        //add dest ips nodes and edges
        let nodeIdex = 1;
        for (const [obj, ips] of Object.entries(podDestIp)) {
            
            //adds the POD node
            Object(this.flowNodes).push(
                { 
                    id: obj, 
                    type: 'ip',
                    data: { 
                        label: obj,
                        ip: ips,
                        title: this.groupByToTitle[this.groupByObject]
                    },
                    ...this.defaultNodeSizes
                }
            )

            this.portToNodeArrayRef[obj] = nodeIdex

            //connect the nodes
            Object(this.flowEdges).push({ 
                id: podName+obj, 
                source: podName, 
                target: obj
            })

            nodeIdex+=1
        }

        return this.getAutoLayoutedElements(this.flowNodes, this.flowEdges)
    }

    UpdateNodes(data:object):object{

        let podName = this.flowNodes[0].id
        
        //separate IP destination on port groups
        let podDestIp = this.getGroupsIps(data)
        let newEdgeIndexRef:object = []
        let newNodesIndexRef:object = []

        for (const [obj, ips] of Object.entries(podDestIp)) {

            //if port exists, means it will be updated
            if(obj in this.portToNodeArrayRef){

                //get the node to update
                if ("ip" in this.flowNodes[this.portToNodeArrayRef[obj]]["data"]){

                    for (const [index, ip] of Object.entries(ips)) {
                        if(!this.flowNodes[this.portToNodeArrayRef[obj]]["data"]["ip"].includes(ip)){
                            this.flowNodes[this.portToNodeArrayRef[obj]]["data"]["ip"].push(ip)
                        }
                    }
                }
            
            }else{ //it needs to create a new node
                
                //adds the new port
                let length = Object(this.flowNodes).push(
                    { 
                        id: obj, 
                        type: 'ip',
                        data: { 
                            label: obj,
                            ip: ips,
                            title: this.groupByToTitle[this.groupByObject]
                        },
                        ...this.defaultNodeSizes
                    }
                )

                this.portToNodeArrayRef[obj] = length-1
                Object(newNodesIndexRef).push(length-1)

                //connect the nodes
                let edgeLengh = Object(this.flowEdges).push({ 
                    id: podName+obj, 
                    source: podName, 
                    target: obj
                })

                Object(newEdgeIndexRef).push(edgeLengh-1)

            }
        }

        let newFlow = this.getAutoLayoutedElements(this.flowNodes, this.flowEdges)

        return {
            nodes: newFlow["nodes"], 
            edges: newFlow["edges"], 
            ref: this.portToNodeArrayRef,
            newEdgeIndexRef: newEdgeIndexRef,
            newNodesIndexRef: newNodesIndexRef
        }
        
    }
}