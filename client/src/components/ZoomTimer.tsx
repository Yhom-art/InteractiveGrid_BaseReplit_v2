import React, { useState, useEffect, useRef } from 'react';

interface ZoomTimerProps {
  onTimerComplete: () => void;
  onTimerStart: () => void;
  onTimerStop: () => void;
  isActive: boolean;
}

export function ZoomTimer({ onTimerComplete, onTimerStart, onTimerStop, isActive }: ZoomTimerProps) {
  const [countdown, setCountdown] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messageRef = useRef<NodeJS.Timeout | null>(null);

  // Démarrer le timer quand isActive devient true
  useEffect(() => {
    if (isActive && !timerRef.current && !showMessage) {
      console.log('🔍 TIMER: Démarrage du timer 10s');
      setCountdown(10);
      onTimerStart();
      
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Timer terminé
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
            console.log('🔍 TIMER: Timer terminé - affichage message cooldown');
            onTimerComplete();
            setShowMessage(true);
            
            // Démarrer le fade du message après 10s
            messageRef.current = setTimeout(() => {
              setShowMessage(false);
              setCountdown(0);
            }, 10000);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // Arrêter et RESET le timer si isActive devient false
    if (!isActive) {
      console.log('🔍 TIMER: Arrêt et reset du timer');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (messageRef.current) {
        clearTimeout(messageRef.current);
        messageRef.current = null;
      }
      setCountdown(0);
      setShowMessage(false);
      onTimerStop();
    }
  }, [isActive, showMessage, onTimerComplete, onTimerStart, onTimerStop]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (messageRef.current) {
        clearTimeout(messageRef.current);
      }
    };
  }, []);

  if (showMessage) {
    return (
      <div 
        className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
        style={{
          animation: 'fadeOut 10s ease-out forwards'
        }}
      >
        <div 
          style={{
            fontFamily: 'DOTO',
            fontSize: '24px',
            fontWeight: '300',
            color: '#FF26BE',
            textAlign: 'center',
            textShadow: '0 0 10px rgba(255, 38, 190, 0.5)'
          }}
        >
          CATCH ME LATER
        </div>
      </div>
    );
  }

  if (countdown > 0) {
    return (
      <div 
        className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
      >
        <div 
          style={{
            fontFamily: 'DOTO',
            fontSize: '132px',
            fontWeight: '100',
            color: 'white',
            lineHeight: 1,
            textShadow: '0 0 20px rgba(255, 255, 255, 0.8)'
          }}
        >
          {countdown}
        </div>
      </div>
    );
  }

  return null;
}