import {React,useState} from 'react';
import "./cardStyle.css"

function Card({headerTitle, additionalClasses=[],noPadding=false, children}) {

  const classes=[
    "component-card",
    "shadow-md",
    "rounded",
    "flex", 
    "flex-col", 
    "col-span-full",
    "sm:col-span-6",
    "xl:col-span-4",
    "bg-white shadow-lg",
    "rounded-sm",
    "border",
    "border-slate-200",
  ]
  const childrenDivClass=["grow"]
  const headerDivClasses=["flex", "justify-between", "items-start"]

  if (!noPadding){
    classes.push("px-8","pt-6","pb-8","mb-4")

    childrenDivClass.push("py-5")

    headerDivClasses.push("mb-2")
  }
  

  return (
    <>
      
    <div className={classes.join(" ")}>

      <header className={headerDivClasses.join(" ")}>
        <b>{headerTitle}</b>
      </header>

			<div className={childrenDivClass.join(" ")}>
        {children}
			</div>
    </div>
    </>
  );
}

export default Card;
