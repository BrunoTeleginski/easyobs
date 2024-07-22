import React, { useState } from 'react';
import Header from '../../partials/Header';
import Banner from '../../partials/Banner';
import Sidebar from '../../partials/Sidebar'

export default function Template({children, showHeader=true, noPadding=false}){

    var mainClassDiv = [
        "px-4", "sm:px-6", "lg:px-8", "py-8", "w-full", "max-w-9xl", "mx-auto"
    ]

    if(noPadding){
        mainClassDiv=[]
    }

    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen overflow-hidden">
            
            <Sidebar sidebarOpen={true} setSidebarOpen={()=>{}}/>

            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

                {/*  Header */}
                {showHeader == true ? (
                    <Header sidebarOpen={sidebarOpen} 
                            setSidebarOpen={setSidebarOpen} 
                            onboardPage={true}
                    />
                ) : (<></>)}
        
                <main>
                    <div className={mainClassDiv.join(" ")}>
                        <div className="grid grid-cols-6 gap-4">
                        <div className="col-span-full">
            
                            {children}
            
                        </div>
            
                        </div>
                    </div>
                </main>
        
                <Banner />
        
            </div>
        </div>
    );
}