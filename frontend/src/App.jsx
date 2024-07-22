import React, { useEffect, useRef, useState } from 'react';
import {
    Routes,
    Route,
    useLocation
} from 'react-router-dom';

import './css/style.css';
import './charts/ChartjsConfig';

// Import pages
import Dashboard from './pages/Dashboard';
import Onboard from './pages/Onboard/Onboard';
import Configuration from './pages/Configuration/Configuration';
import Index from './pages/Index/Index';
import Load from './components/Load/Load'
//LIB
import ws from './lib/ws';
import eventHandler from './lib/eventHandler';
//CONTEXT
import {GlobalContext} from './Context/GlobalContext'

function App() {

    const location = useLocation();
    const isMounted = useRef(false)
    const [isLoading, setIsLoading] = useState(true)
    const [eventMsg, setEventMsg] = useState({});

    useEffect(() => {

        document.querySelector('html').style.scrollBehavior = 'auto'
        window.scroll({ top: 0 })
        document.querySelector('html').style.scrollBehavior = ''

        if (!isMounted.current){
            isMounted.current=true
            //eventConnnect()
            setIsLoading(false)
        }

    }, [location.pathname]); // triggered on route change

    return (
        <>
            <GlobalContext.Provider value={eventMsg}>
                <Load loading={isLoading}>
                    <Routes>
                        {/* <Route exact path="/" element={<Dashboard />} /> */}
                        <Route exact path="/config" element={<Configuration />} />
                        <Route exact path="/" element={<Index />} />
                    </Routes>
                </Load>
            </GlobalContext.Provider>
        </>
    );

    

    /**Global events */
    function eventConnnect() {
        eventHandler.getClass().connect("global", (event)=>{
            setEventMsg({
                global: event.data,
                ...eventMsg
            })
        })

        eventHandler.getClass().connect("watcher", (event)=>{
            setEventMsg({
                watcher: event.data,
                ...eventMsg
            })
        })
        
        setIsLoading(false)
    }
}

export default App;
