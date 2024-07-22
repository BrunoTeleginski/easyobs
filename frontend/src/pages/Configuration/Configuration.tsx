import React, { useState } from 'react';

import Template from '../../components/Template/Template';
//COMPONENTS
import Card from '../../components/Card/Card'
import InputString from '../../components/Inputs/String/InputString'
import InputSelect from '../../components/Inputs/Select/InputSelect'
//DATAHOLDER
import {BPF_FORM_EVENT_TYPE_LIST} from "../../Dataholder/DataHolder"

//Form Interface
interface IbpfForm{
  program_name: string,
  event_type: string,
}

function Configuration(form:IbpfForm) {

  //form State
  const [BPFForm, setBPFForm] = useState(form);

  //tabs State
  const [section, setSection] = useState({
    "bpf_config": true,
    "target_config": false
  });

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

      <Template>
          {/*  Tabs  */}
          <CardTabs/>

          {/*  Cards */}
          <Card headerTitle={"Configuration for your BPF program attachment:"}>
            <form className="bg-white rounded">
              {
                section['bpf_config'] == true ? (<>
                    <InputString
                      key="prog_name"
                      displayName="Program name"
                      value={BPFForm.program_name}
                      changeFunc={(value: string) => {updateFormState({program_name:value},"program_name")}}
                    />

                    <InputSelect
                      key="event_type"
                      displayName="Event type"
                      value={BPFForm.event_type}
                      list={BPF_FORM_EVENT_TYPE_LIST}
                      changeFunc={(value: string) => {updateFormState({event_type:value},"event_type")}}
                    />
                </>) : ""
              }
            </form>
          </Card>
      </Template>

      </div>
    </div>
  );

  //Update form state
  function updateFormState(value: Partial<IbpfForm>,key:string){
    setBPFForm(prevState => {
      return {...prevState, ...value};
    });
  }

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
                  class={ClassHightlighted(section["bpf_config"])} 
                  onClick={() => setSection({"bpf_config": true,"target_config": false})}>
                  BPF configuration
                </a>
            </li>
            <li class="mr-2">
                <a href="#" 
                  class={ClassHightlighted(section["target_config"])}
                  onClick={() => setSection({"bpf_config": false,"target_config": true})}
                  >
                  Target
                </a>
            </li>
            {/* <li class="mr-2">
                <a href="#" class={ClassHightlighted(false)}>
                  Config
                </a>
            </li> */}
        </ul>
      </div>
    </>
    );
  }

}



export default Configuration;