import React, {useState } from 'react';

export default function Modal({children}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* <button onClick={() => setIsOpen(true)} className="bg-blue-500 text-white p-2">Open Modal</button> */}

      {isOpen && (
        <div className="fixed top-0 left-0 h-full w-full flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white p-6 rounded-lg">
            
            {children}

            <button onClick={() => setIsOpen(false)} className="bg-red-500 text-white p-2">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}