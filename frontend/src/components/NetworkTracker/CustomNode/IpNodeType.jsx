import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';

const handleStyle = { left: 10 };



export default function CustomNode({ data }) {
    //console.log("DATA COMMING IN: ",data)

    const onChange = useCallback((evt) => {
        console.log(evt.target.value);
    }, []);

    return (
    <>
        <Handle type="target" position={Position.Top} />
        <div className={"p-5 "+changeBg(data.title, data.label)+" shadow-xl text-white"}>

            <label><b>{data.title}: </b>{data.label}</label><br/><br/>
            
            <ListIpsComponent ips={data.ip}/>

            

            {/* <label htmlFor="text">Text:</label>
            <input id="text" name="text" onChange={onChange} className="nodrag" /> */}

        </div>
        <Handle type="source" position={Position.Bottom} id="a" />
        <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} />
    </>
    );
}

function ListIpsComponent({ips}){

    let elem

    if (typeof ips == "object"){
        elem = <label><b>IP: </b></label>
        
        elem = Object.keys(ips).map(key => 
            <p key={key}>{ips[key]}</p>
        )

    }else{
        <label><b>IP: </b>{ips}</label>
    }

    return elem
}

function changeBg(title, label){
    if(title != "Port"){
        return "bg-slate-400"
    }

    switch (label) {
        case "80":
            return "bg-red-500"
    
        case "443":
            return "bg-green-500"

        default:
            return "bg-slate-400"
            break;
    }
}