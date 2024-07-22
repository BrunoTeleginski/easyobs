import React, {useState } from 'react';
import {ISelectInput} from "../../../Dataholder/Dataholder"

export default function InputSelect(probs: ISelectInput) {

    return (
        <div>
            <div className="mb-3">
                <label htmlFor="countries" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    {probs.displayName}
                </label>
                <select 
                    value={probs.value} 
                    id="countries" 
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    onChange={evt => probs.changeFunc(evt.target.value)}
                >
                    <option key="empty" selected>Choose a type</option>
                    {
                        Object.keys(probs.list).map((index) => (
                            <option key={index} value={probs.list[index].key}>{probs.list[index].value}</option>
                        ))
                    }
                </select>
            </div>
        </div>
    );
}