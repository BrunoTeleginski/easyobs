import React, { useState, useEffect, useRef } from 'react';
//COMPONENTS
import { Rings } from  'react-loader-spinner'
//CONTEXT
import {GlobalContext} from '../../Context/GlobalContext'

export default function RunningChecker(){

    const eventMsg = React.useContext(GlobalContext);
    const [running, setRunning] = useState(false)

    //check changes on the eventMsg context
    useEffect(()=>{
        if(eventMsg.watcher){
            switch (eventMsg.watcher) {
                case "watcher:running":
                    setRunning(true)
                    break;
                default:
                    setRunning(false)
                    break;
            }
        }
    }, [eventMsg])

    return (
        <>
            {
                running ? (
                    <>
                        <div>
                            <Rings
                                height="70"
                                width="70"
                                color="#4fa94d"
                                radius="6"
                                wrapperStyle={{}}
                                wrapperClass="flex-row-reverse"
                                visible={true}
                                ariaLabel="qedqed"
                            >
                            </Rings>
                        </div>
                    </>
                ) : (
                    <>
                        <Rings
                            height="70"
                            width="70"
                            color="#fb9393"
                            radius="6"
                            wrapperStyle={{}}
                            wrapperClass="flex-row-reverse"
                            visible={true}
                            ariaLabel="rings-loading"
                        />
                    </>
                )
            }
        </>
    )
}