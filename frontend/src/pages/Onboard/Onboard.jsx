import React, { useState } from 'react';

import Sidebar from '../../partials/Sidebar';
import Header from '../../partials/Header';
import Banner from '../../partials/Banner';
//COMPONENTS
import Card from '../../components/Card/Card'
import FormBuilder from "../../components/FormBuilder/FormBuilder"


function Onboard() {

  //States
  const [section, setSection] = useState({
    "section_logging": true,
    "section_metrics": false
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);


  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onboardPage={true}/>

        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="grid grid-cols-6 gap-4">
              <div className="col-start-2 col-span-4">

                {/*  Tabs  */}
                <CardTabs/>

                {/*  Cards */}
                <Card headerTitle={""}>
                  <form className="bg-white rounded">
                    {
                      section['section_logging'] == true ? (
                        <FormBuilder section={"section_logging"}/>
                      ) : ""
                    }
                  </form>
                </Card>

              </div>

            </div>
          </div>
        </main>

        <Banner />

      </div>
    </div>
  );

  

  //cards tab
  function CardTabs(){

    //functions 
    function ClassHightlighted(active=false){
      if(active){
        return "inline-block p-4 rounded-t-lg border-b-2 text-blue-600 border-blue-600 active dark:text-blue-500 dark:border-blue-500"
      }else{
        return "inline-block p-4 rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
      }
    }
  
  
    return (
      <>
        {/* TABS */}
        <div class="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul class="flex flex-wrap -mb-px">
            <li class="mr-2">
                <a href="#" 
                  class={ClassHightlighted(section["section_logging"])} 
                  onClick={() => setSection({"section_logging": true,"section_metrics": false})}>
                  Logging
                </a>
            </li>
            <li class="mr-2">
                <a href="#" 
                  class={ClassHightlighted(section["section_metrics"])}
                  onClick={() => setSection({"section_logging": false,"section_metrics": true})}
                  >
                  Metrics
                </a>
            </li>
            <li class="mr-2">
                <a href="#" class={ClassHightlighted(false)}>
                  Config
                </a>
            </li>
        </ul>
      </div>
    </>
    );
  }

}



export default Onboard;