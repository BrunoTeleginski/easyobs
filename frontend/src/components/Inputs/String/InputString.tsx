import React, {useState } from 'react';
import {IInput} from "../../../Dataholder/Dataholder"

export default function InputString(probs: IInput) {

    return (
        <div>
            <div className="mb-3">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    {probs.displayName}
                </label>
                <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    type="text" 
                    placeholder={probs.displayName}
                    value={probs.value}
                    onChange={evt => probs.changeFunc(evt.target.value)}
                />
            </div>
        </div>
    );
}