import React, { useState, useEffect, useRef, useCallback } from 'react';

/** Maps prompt weight to halo size. */
const MIN_HALO_SCALE = 1;
const MAX_HALO_SCALE = 1.5;

/** The amount of scale to add to the halo based on audio level. */
const HALO_LEVEL_MODIFIER = 1;

interface WeightKnobProps {
  value?: number;
  color?: string;
  audioLevel?: number;
  className?: string;
  onInput?: (value: number) => void;
}

const WeightKnob: React.FC<WeightKnobProps> = ({
  value = 0,
  color = '#000',
  audioLevel = 0,
  className = '',
  onInput
}) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef(0);
  const dragStartValue = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use refs to maintain stable references and prevent unnecessary re-renders
  const currentValueRef = useRef(currentValue);
  const onInputRef = useRef(onInput);
  const isDraggingRef = useRef(isDragging);
  const lastNotifiedValueRef = useRef(value);

  // Keep refs in sync
  useEffect(() => {
    currentValueRef.current = currentValue;
  }, [currentValue]);

  useEffect(() => {
    onInputRef.current = onInput;
  }, [onInput]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // Sync with external value changes - but prevent feedback loops
  useEffect(() => {
    // Only update if the external value is significantly different and we're not dragging
    if (!isDraggingRef.current && Math.abs(value - currentValue) > 0.001) {
      setCurrentValue(value);
      lastNotifiedValueRef.current = value;
    }
  }, [value]); // Don't include currentValue to prevent loops

  // Notify parent of value changes - with debouncing to prevent excessive calls
  const notifyValueChange = useCallback((newValue: number) => {
    // Only notify if the value actually changed significantly
    if (Math.abs(newValue - lastNotifiedValueRef.current) > 0.001) {
      lastNotifiedValueRef.current = newValue;
      onInputRef.current?.(newValue);
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragStartPos.current = e.clientY;
    dragStartValue.current = currentValueRef.current;
    setIsDragging(true);
    document.body.classList.add('dragging');
    
    // Capture pointer to ensure we get move/up events even outside the element
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const delta = dragStartPos.current - e.clientY;
    const newValue = Math.max(0, Math.min(2, dragStartValue.current + delta * 0.01));
    
    // Update internal state immediately for smooth UI
    if (Math.abs(newValue - currentValueRef.current) > 0.001) {
      setCurrentValue(newValue);
      notifyValueChange(newValue);
    }
  }, [notifyValueChange]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    document.body.classList.remove('dragging');
    
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const delta = e.deltaY;
    const newValue = Math.max(0, Math.min(2, currentValueRef.current + delta * -0.0025));
    
    // Update and notify if value changed significantly
    if (Math.abs(newValue - currentValueRef.current) > 0.001) {
      setCurrentValue(newValue);
      notifyValueChange(newValue);
    }
  }, [notifyValueChange]);

  const describeArc = useCallback((
    centerX: number,
    centerY: number,
    startAngle: number,
    endAngle: number,
    radius: number,
  ): string => {
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';

    return (
      `M ${startX} ${startY}` +
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`
    );
  }, []);

  // Memoize static SVG to prevent unnecessary re-renders
  const staticSvg = useRef<React.ReactElement | null>(null);
  if (!staticSvg.current) {
    staticSvg.current = (
      <svg viewBox="0 0 80 80" className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <ellipse
          opacity="0.4"
          cx="40"
          cy="40"
          rx="40"
          ry="40"
          fill="url(#f1)" />
        <g filter="url(#f2)">
          <ellipse cx="40" cy="40" rx="29" ry="29" fill="url(#f3)" />
        </g>
        <g filter="url(#f4)">
          <circle cx="40" cy="40" r="20.6667" fill="url(#f5)" />
        </g>
        <circle cx="40" cy="40" r="18" fill="url(#f6)" />
        <defs>
          <filter
            id="f2"
            x="8.33301"
            y="10.0488"
            width="63.333"
            height="64"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha" />
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="1.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="shadow1" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="shadow1"
              result="shape" />
          </filter>
          <filter
            id="f4"
            x="11.333"
            y="19.0488"
            width="57.333"
            height="59.334"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha" />
            <feOffset dy="10" />
            <feGaussianBlur stdDeviation="4" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="shadow1" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha" />
            <feMorphology
              radius="5"
              operator="erode"
              in="SourceAlpha"
              result="shadow2" />
            <feOffset dy="8" />
            <feGaussianBlur stdDeviation="3" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
            <feBlend mode="normal" in2="shadow1" result="shadow2" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="shadow2"
              result="shape" />
          </filter>
          <linearGradient
            id="f1"
            x1="40"
            y1="0"
            x2="40"
            y2="80"
            gradientUnits="userSpaceOnUse">
            <stop stopOpacity="0.5" />
            <stop offset="1" stopColor="white" stopOpacity="0.3" />
          </linearGradient>
          <radialGradient
            id="f3"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(40 40) rotate(90) scale(29 29)">
            <stop offset="0.6" stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0.7" />
          </radialGradient>
          <linearGradient
            id="f5"
            x1="40"
            y1="19.0488"
            x2="40"
            y2="60.3822"
            gradientUnits="userSpaceOnUse">
            <stop stopColor="white" />
            <stop offset="1" stopColor="#F2F2F2" />
          </linearGradient>
          <linearGradient
            id="f6"
            x1="40"
            y1="21.7148"
            x2="40"
            y2="57.7148"
            gradientUnits="userSpaceOnUse">
            <stop stopColor="#EBEBEB" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Calculate rotation and halo scale
  const rotationRange = Math.PI * 2 * 0.75;
  const minRot = -rotationRange / 2 - Math.PI / 2;
  const maxRot = rotationRange / 2 - Math.PI / 2;
  const rot = minRot + (currentValue / 2) * (maxRot - minRot);

  let scale = (currentValue / 2) * (MAX_HALO_SCALE - MIN_HALO_SCALE);
  scale += MIN_HALO_SCALE;
  scale += audioLevel * HALO_LEVEL_MODIFIER;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full aspect-square flex-shrink-0 cursor-grab touch-none ${className}`}
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Halo */}
      <div
        className="absolute -z-10 top-0 left-0 w-full h-full rounded-full will-change-transform"
        style={{
          display: currentValue > 0 ? 'block' : 'none',
          background: color,
          transform: `scale(${scale})`,
          mixBlendMode: 'lighten',
        }}
      />
      
      {/* Static SVG elements */}
      {staticSvg.current}
      
      {/* Interactive SVG elements */}
      <svg 
        viewBox="0 0 80 80" 
        className="absolute top-0 left-0 w-full h-full"
      >
        {/* Knob indicator dot */}
        <g 
          style={{
            transform: `translate(40px, 40px) rotate(${rot}rad)`,
          }}
        >
          <circle cx="14" cy="0" r="2" fill="#000" />
        </g>
        
        {/* Background arc */}
        <path
          d={describeArc(40, 40, minRot, maxRot, 34.5)}
          fill="none"
          stroke="rgba(0, 0, 0, 0.2)"
          strokeWidth="3"
          strokeLinecap="round" 
        />
        
        {/* Progress arc */}
        <path
          d={describeArc(40, 40, minRot, rot, 34.5)}
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round" 
        />
      </svg>
    </div>
  );
};

export { WeightKnob };