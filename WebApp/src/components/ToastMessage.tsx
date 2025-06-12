/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, forwardRef, useImperativeHandle } from 'react';

interface ToastMessageProps {
  className?: string;
}

export interface ToastMessageRef {
  show: (message: string) => void;
  hide: () => void;
}

export const ToastMessage = forwardRef<ToastMessageRef, ToastMessageProps>(
  ({ className = '' }, ref) => {
    const [message, setMessage] = useState('');
    const [showing, setShowing] = useState(false);

    useImperativeHandle(ref, () => ({
      show: (message: string) => {
        setShowing(true);
        setMessage(message);
      },
      hide: () => {
        setShowing(false);
      },
    }));

    const handleHide = () => {
      setShowing(false);
    };

    return (
      <div
        className={`
          fixed top-5 left-1/2 -translate-x-1/2
          bg-black text-white px-4 py-3 rounded
          flex items-center justify-between gap-4
          min-w-[200px] max-w-[80vw]
          transition-transform duration-500 ease-out
          ${showing 
            ? 'transform -translate-x-1/2' 
            : 'transform -translate-x-1/2 -translate-y-[200%] transition-duration-1000'
          }
          ${className}
        `}
        style={{
          lineHeight: '1.6',
          transitionTimingFunction: showing 
            ? 'cubic-bezier(0.19, 1, 0.22, 1)' 
            : 'cubic-bezier(0.19, 1, 0.22, 1)'
        }}
      >
        <div className="message">{message}</div>
        <button
          onClick={handleHide}
          className="rounded-full aspect-square border-none text-black cursor-pointer bg-white hover:bg-gray-200 w-6 h-6 flex items-center justify-center text-sm"
        >
          ✕
        </button>
      </div>
    );
  }
);

ToastMessage.displayName = 'ToastMessage';

export default ToastMessage;