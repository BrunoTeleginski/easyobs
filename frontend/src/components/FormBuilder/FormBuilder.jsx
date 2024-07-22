import {React, useState, useRef} from 'react';
import "./formBuilderStyle.css"
import Modal from '../Modal/Modal';

export default function FormBuilder({section}) {

    const [jsonFields, setFormJson] = useState({
        "section_logging": {
            // "fluent-bit.activation.enable": {
            //     "type": "boolean",
            //     "displayName": "Activate log collector",
            //     "value": true
            // }
            // "fluent-bit.additionalPathLogs": {
            //     "type": "array",
            //     "displayName": "Path list for logs",
            //     "value": ["/log/amiod"]
            // }
            // "fluent-bit.tolerations": {
            //     "type": "array",
            //     "object": {
            //         "key": {
            //             "type":"string"
            //         },
            //         "operator": {
            //             "type":"string"
            //         },
            //         "value": {
            //             "type":"string"
            //         },
            //         "effect": {
            //             "type":"string"
            //         }
            //     },
            //     "displayName": "Node tolerations",
            //     "value": [
            //         {
            //             "key": "key-v",
            //             "operator": "operator-v",
            //             "value": "value-v",
            //             "effect": "effect-v"
            //         }
            //     ]
            // }
            "fluent-bit.filters_var.cluster_name": {
                "type": "string",
                "displayName": "Cluster name to identify it",
                "value": ""
            }
            // "fluent-bit.outputs_var.Host": {
            //     "type": "string",
            //     "displayName": "Output host for fluent-bit",
            //     "value": ""
            // }
        }
    });

    const [modalContent, setModalContent] = useState(<>
        <h1 className="text-lg font-medium mb-4">Modal Title</h1>
        <p className="text-gray-700 mb-4">Modal content goes here</p>
    </>)

    return (
        <div>
        
            {Object.keys(jsonFields[section]).map((key) => {

                const obj = jsonFields[section][key]

                switch (obj.type) {
                    case "string":
                        return (
                            <div className="mb-3">
                                <label className="block text-gray-700 text-sm font-bold mb-2" for="username">
                                    {obj.displayName}
                                </label>
                                <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                                    id={key}
                                    key={key}
                                    type="text" 
                                    placeholder={obj.displayName}
                                    value={obj.value}
                                    onChange={evt => (updateInputValue(evt,section,key))}
                                />
                            </div>
                        ) 
                    break;

                    case "boolean":
                        return (
                            <div className="mb-3">
                                <label class="inline-flex relative items-center cursor-pointer">
                                    <input type="checkbox" 
                                           className="sr-only peer"
                                           onChange={evt => (checklistValue(section,key))}
                                           checked={obj.value}
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{obj.displayName}</span>
                                </label>
                            </div>
                        ) 
                    break;
                    
                    case "array":
    
                        return (
                            <TableInput item={obj}/>
                        )
                        
                    break;
                }

            })}

            {/* Unique modal that loads table editors */}
            <Modal>
                {modalContent}
            </Modal>
            
        </div>
    );
    
    //functions
    function TableInput({item}){

        return (
            <div className="py-6">


                <div className="overflow-x-auto relative shadow">
                
                    {/* Add value on the table using modal*/}
                    <div className='mb-2'>
                        <a
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </a>
                    </div>


                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                {/* Header */}
                                {
                                    "object" in item ? 
                                        Object.keys(item.object).map((key) => (
                                            <th scope="col" className="py-3 px-6">
                                                {key}
                                            </th>
                                        ))
                                    : 
                                    (
                                        <th scope="col" className="py-3 px-6">
                                            {item.displayName}
                                        </th>
                                    )
                                }
                                <th scope="col" className="py-3 px-6">
                                    Remove
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                                {/* Rows */}
                                {
                                    Object.keys(item.value).map((index) => (
                                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                            {
                                                "object" in item ? 
                                                    Object.keys(item.object).map((key) => (
                                                        <td className="py-4 px-6">
                                                            {item.value[index][key]}
                                                        </td>
                                                    ))    
                                                :

                                                <td className="py-4 px-6">
                                                    {item.value[index]}
                                                </td>
                                            }
                                            
                                            <td className="py-4 px-6">
                                                
                                            </td>
                                        </tr>
                                    ))
                                }

                            {/* <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    wefwefwefwefwfwef
                                </th>
                                <td className="py-4 px-6">
                                    Sliver
                                </td>
                                <td className="py-4 px-6">
                                    Laptop
                                </td>
                                <td className="py-4 px-6">
                                    $2999
                                </td>
                            </tr>
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    Microsoft Surface Pro
                                </th>
                                <td className="py-4 px-6">
                                    White
                                </td>
                                <td className="py-4 px-6">
                                    Laptop PC
                                </td>
                                <td className="py-4 px-6">
                                    $1999
                                </td>
                            </tr>
                            <tr className="bg-white dark:bg-gray-800">
                                <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    Magic Mouse 2
                                </th>
                                <td className="py-4 px-6">
                                    Black
                                </td>
                                <td className="py-4 px-6">
                                    Accessories
                                </td>
                                <td className="py-4 px-6">
                                    $99
                                </td>
                            </tr> */}

                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    function updateInputValue(evt,section,key){
        
        const val = evt.target.value;
        const newJsonFields = jsonFields

        newJsonFields[section][key]["value"] = val
        setFormJson({
            ...jsonFields,
            ...newJsonFields
        })
    }

    function checklistValue(section,key){
        
        const newJsonFields = jsonFields

        newJsonFields[section][key]["value"] = (!newJsonFields[section][key]["value"])
        setFormJson({
            ...jsonFields,
            ...newJsonFields
        })
    }
}
