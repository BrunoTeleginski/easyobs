import React, { useState, useEffect, useRef } from 'react';

import Template from "../../components/Template/Template"
//COMPONENTS
import Card from '../../components/Card/Card'
import NetworkTracker from '../../components/NetworkTracker/NetworkTracker'
import InputString from '../../components/Inputs/String/InputString'
import InputSelect from '../../components/Inputs/Select/InputSelect'
import Load from '../../components/Load/Load'
import { Oval } from  'react-loader-spinner'
//LIBs
import axiosApi from '../../lib/axiosApi';
import ws from '../../lib/ws';
//CSS
import "./indexStyle.css"
//CONTEXT
import {GlobalContext} from '../../Context/GlobalContext'
import eventHandler from '../../lib/eventHandler';


function Index () {

    const [loading, setLoading] = useState(true)
    const isMounted = useRef(false)
    const [isLoading, setIsLoading] = useState(true)
    const [eventMsg, setEventMsg] = useState({});

    //check changes on the eventMsg context
    useEffect(()=>{
        if(eventMsg.watcher){
            switch (eventMsg.watcher) {
                case "watcher:running":
                    setLoading(false)
                    break;
                default:
                    setLoading(true)
                    break;
            }
        }
    }, [eventMsg])

    //called once
    useEffect(() => {
        if (!isMounted.current){
            isMounted.current=true
            //eventConnnect()
            //eventPodNetwork("teleginski")
        }
    },[]);
    

    return (
        <Template showHeader={true}>
            <Card headerTitle="" noPadding>
                <div style={{ height: '500px' }}>
                    <NetworkTracker/>
                </div>

                {/* <div className="grid grid-cols-12">
                    <div className="col-start-6 col-span-2">
                        <Load loading={loading}>
                            <h1>already started!</h1>
                        </Load>
                    </div>
                </div> */}
            </Card>
        </Template>
    );
    
    /*
        auxiliar functions
    */
    function eventPodNetwork(pod) {
        eventHandler.getClass("/network/event/"+pod).connect("networktracker", (event)=>{
            setEventMsg({
                global: event.data,
                ...eventMsg
            })
        })
        
        //setIsLoading(false)
    }

    

}

export default Index;