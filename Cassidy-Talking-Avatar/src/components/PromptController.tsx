import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WeightKnob } from './WeightKnob';
import { MidiDispatcher } from '../utils/MidiDispatcher';

interface Prompt {
  readonly promptId: string;
  text: string;
  weight: number;
  cc: number;
  color: string;
}

interface ControlChange {
  channel: number;
  cc: number;
  value: number;
}

interface PromptControllerProps {
  promptId?: string;
  text?: string;
  weight?: number;
  color?: string;
  cc?: number;
  channel?: number;
  learnMode?: boolean;
  showCC?: boolean;
  midiDispatcher?: MidiDispatcher | null;
  audioLevel?: number;
  filtered?: boolean;
  onPromptChanged?: (prompt: Prompt) => void;
}

export const PromptController: React.FC<PromptControllerProps> = ({
  promptId = '',
  text: initialText = '',
  weight: initialWeight = 0,
  color = '',
  cc: initialCC = 0,
  channel: initialChannel = 0,
  learnMode: initialLearnMode = false,
  showCC = false,
  midiDispatcher = null,
  audioLevel = 0,
  filtered = false,
  onPromptChanged
}) => {
  const [text, setText] = useState(initialText);
  const [weight, setWeight] = useState(initialWeight);
  const [cc, setCC] = useState(initialCC);
  const [channel, setChannel] = useState(initialChannel);
  const [learnMode, setLearnMode] = useState(initialLearnMode);
  const [lastValidText, setLastValidText] = useState(initialText);

  const textInputRef = useRef<HTMLSpanElement>(null);
  
  // Track if we're currently updating from props to prevent callback loops
  const isUpdatingFromPropsRef = useRef(false);
  
  // Track the last values we sent to parent to prevent duplicate calls
  const lastSentValuesRef = useRef({ text: initialText, weight: initialWeight, cc: initialCC });

  // Stable callback for dispatching changes
  const dispatchPromptChange = useCallback((newText: string, newWeight: number, newCC: number) => {
    if (!onPromptChanged || isUpdatingFromPropsRef.current) return;
    
    // Only dispatch if values actually changed
    const lastSent = lastSentValuesRef.current;
    if (lastSent.text === newText && lastSent.weight === newWeight && lastSent.cc === newCC) {
      return;
    }
    
    // Update last sent values
    lastSentValuesRef.current = { text: newText, weight: newWeight, cc: newCC };
    
    const prompt: Prompt = {
      promptId,
      text: newText,
      weight: newWeight,
      cc: newCC,
      color,
    };
    
    onPromptChanged(prompt);
  }, [promptId, color, onPromptChanged]);

  // Handle MIDI events
  useEffect(() => {
    if (!midiDispatcher) return;

    const handleCCMessage = (event: CustomEvent<ControlChange>) => {
      const { channel: msgChannel, cc: msgCC, value } = event.detail;
      
      if (learnMode) {
        const newCC = msgCC;
        setCC(newCC);
        setChannel(msgChannel);
        setLearnMode(false);
        // Dispatch the CC change
        dispatchPromptChange(text, weight, newCC);
      } else if (msgCC === cc) {
        const newWeight = (value / 127) * 2;
        setWeight(newWeight);
        // Dispatch the weight change
        dispatchPromptChange(text, newWeight, cc);
      }
    };

    midiDispatcher.addEventListener('cc-message', handleCCMessage as EventListener);
    
    return () => {
      midiDispatcher.removeEventListener('cc-message', handleCCMessage as EventListener);
    };
  }, [midiDispatcher, learnMode, cc, text, weight, dispatchPromptChange]);

  // Update learn mode when showCC changes
  useEffect(() => {
    if (!showCC) {
      setLearnMode(false);
    }
  }, [showCC]);

  // Sync with external prop changes - CRITICAL: Prevent callback loops
  useEffect(() => {
    isUpdatingFromPropsRef.current = true;
    
    let hasChanges = false;
    
    if (initialText !== text) {
      setText(initialText);
      setLastValidText(initialText);
      hasChanges = true;
    }
    
    if (Math.abs(initialWeight - weight) > 0.001) {
      setWeight(initialWeight);
      hasChanges = true;
    }
    
    if (initialCC !== cc) {
      setCC(initialCC);
      hasChanges = true;
    }
    
    // Update last sent values to match current props to prevent immediate callback
    if (hasChanges) {
      lastSentValuesRef.current = { 
        text: initialText, 
        weight: initialWeight, 
        cc: initialCC 
      };
    }
    
    isUpdatingFromPropsRef.current = false;
  }, [initialText, initialWeight, initialCC]);

  useEffect(() => {
    setLearnMode(initialLearnMode);
  }, [initialLearnMode]);

  const updateText = async () => {
    const newText = textInputRef.current?.textContent?.trim();
    if (!newText) {
      setText(lastValidText);
      if (textInputRef.current) {
        textInputRef.current.textContent = lastValidText;
      }
    } else {
      setText(newText);
      setLastValidText(newText);
      // Dispatch text change
      dispatchPromptChange(newText, weight, cc);
    }
  };

  const onFocus = () => {
    const selection = window.getSelection();
    if (!selection || !textInputRef.current) return;
    
    const range = document.createRange();
    range.selectNodeContents(textInputRef.current);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  // Handle weight updates from knob
  const updateWeight = useCallback((newWeight: number) => {
    // Prevent update if it's too similar to current value
    if (Math.abs(newWeight - weight) < 0.001) return;
    
    setWeight(newWeight);
    // Dispatch weight change
    dispatchPromptChange(text, newWeight, cc);
  }, [text, weight, cc, dispatchPromptChange]);

  const toggleLearnMode = () => {
    setLearnMode(!learnMode);
  };

  const promptClasses = `
    prompt-controller-container
    ${learnMode ? 'learn-mode' : ''}
    ${showCC ? 'show-cc' : ''}
  `;

  return (
    <div className={promptClasses}>
      <style jsx>{`
        .prompt-controller-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: min(1.5vw, 12px);
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: min(1.2vw, 12px);
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
        }
        
        .prompt-controller-container:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .weight-knob {
          width: min(85%, 80px);
          height: min(85%, 80px);
          flex-shrink: 0;
          margin-bottom: min(1vw, 8px);
        }
        
        .midi-display {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          text-align: center;
          font-size: min(1.3vw, 11px);
          font-weight: 600;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          border-radius: min(0.8vw, 6px);
          padding: min(0.4vw, 3px) min(0.8vw, 6px);
          color: rgba(255, 255, 255, 0.8);
          background: rgba(0, 0, 0, 0.4);
          cursor: pointer;
          visibility: hidden;
          user-select: none;
          margin-top: min(0.6vw, 4px);
          transition: all 0.2s ease;
          backdrop-filter: blur(2px);
        }
        
        .midi-display:hover {
          background: rgba(0, 0, 0, 0.6);
          border-color: rgba(255, 255, 255, 0.5);
        }
        
        .learn-mode .midi-display {
          color: #ff9500;
          border-color: #ff9500;
          background: rgba(255, 149, 0, 0.1);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        .show-cc .midi-display {
          visibility: visible;
        }
        
        .text-input {
          font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 500;
          font-size: min(1.4vw, 12px);
          line-height: 1.3;
          max-width: 100%;
          min-width: 20px;
          padding: min(0.4vw, 3px) min(0.6vw, 4px);
          margin-top: min(0.6vw, 4px);
          flex-shrink: 0;
          border-radius: min(0.6vw, 4px);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          border: none;
          outline: none;
          -webkit-font-smoothing: antialiased;
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
          cursor: text;
        }
        
        .text-input:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        
        .text-input:focus {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          white-space: normal;
          word-break: break-word;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
        }
        
        .text-input:not(:focus) {
          text-overflow: ellipsis;
        }
        
        .filtered .text-input {
          color: #ff6b6b;
          background: rgba(255, 107, 107, 0.1);
        }
        
        /* Mobile optimizations */
        @media only screen and (max-width: 768px) {
          .prompt-controller-container {
            padding: 8px;
          }
          
          .text-input {
            font-size: 10px;
          }
          
          .midi-display {
            font-size: 9px;
            padding: 2px 4px;
          }
          
          .weight-knob {
            width: min(75%, 70px);
            height: min(75%, 70px);
          }
        }
        
        /* Ultra-wide screen optimizations */
        @media only screen and (min-width: 1920px) {
          .text-input {
            font-size: 14px;
          }
          
          .midi-display {
            font-size: 12px;
          }
        }
      `}</style>
      
      <WeightKnob
        className="weight-knob"
        value={weight}
        color={color}
        audioLevel={audioLevel}
        onInput={updateWeight}
      />
      
      <span
        ref={textInputRef}
        className={`text-input ${filtered ? 'filtered' : ''}`}
        contentEditable="plaintext-only"
        suppressContentEditableWarning={true}
        spellCheck={false}
        onFocus={onFocus}
        onBlur={updateText}
      >
        {text}
      </span>
      
      <div 
        className="midi-display"
        onClick={toggleLearnMode}
      >
        {learnMode ? 'LEARN' : `CC:${cc}`}
      </div>
    </div>
  );
};

// Grid container component for 4x4 layout
export const PromptControllerGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="prompt-grid-container">
      <style jsx>{`
        .prompt-grid-container {
          width: 100%;
          height: 100vh;
          max-height: 100vh;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(4, 1fr);
          gap: min(1.5vw, 16px);
          padding: min(2vw, 20px);
          box-sizing: border-box;
          background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
          overflow: hidden;
        }
        
        /* Ensure grid items maintain aspect ratio and fit properly */
        .prompt-grid-container > * {
          min-height: 0;
          min-width: 0;
          aspect-ratio: 1;
        }
        
        /* Mobile adjustments */
        @media only screen and (max-width: 768px) {
          .prompt-grid-container {
            gap: 8px;
            padding: 12px;
          }
        }
        
        /* Large screen adjustments */
        @media only screen and (min-width: 1920px) {
          .prompt-grid-container {
            gap: 24px;
            padding: 32px;
          }
        }
        
        /* Portrait orientation adjustments */
        @media only screen and (orientation: portrait) {
          .prompt-grid-container {
            height: 100vw;
            max-height: none;
          }
        }
      `}</style>
      {children}
    </div>
  );
};

export default PromptController;