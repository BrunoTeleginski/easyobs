import React, { useState } from 'react';
//COMPONENTS
import { Oval } from  'react-loader-spinner'
//css
import "./loadStyle.css"

export default function Load({children, loading=true}) {

    return (
        <>
            {loading == true ? setLoading() : body()}
        </>
    );

    function setLoading(){
        return (
            <Oval
                color="#833cc6"
                secondaryColor="#833cc6"
                wrapperStyle={{}}
                wrapperClass="loadClass"
                visible={true}
                ariaLabel='oval-loading'
                strokeWidth={8}
                strokeWidthSecondary={8}
            />
        )
    }

    function body(){
        return children
    }
}