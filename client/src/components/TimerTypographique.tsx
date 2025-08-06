import React from 'react';

interface TimerTypographiqueProps {
  countdown: number;
  isVisible: boolean;
}

export function TimerTypographique({ countdown, isVisible }: TimerTypographiqueProps) {
  if (!isVisible) return null;

  return (
    <div
      className="timer-typographique"
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
        pointerEvents: 'none',
        fontFamily: 'Open Mono, monospace',
        fontSize: '48px',
        fontWeight: 400,
        color: '#000',
        textAlign: 'center',
        lineHeight: 0.9,
        userSelect: 'none'
      }}
    >
      {countdown.toString().padStart(2, '0')}
    </div>
  );
}