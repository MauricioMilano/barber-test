import { useEffect, useCallback } from 'react';
import { useTotemFlow } from '@/lib/totem-flow-store';

const IDLE_TIMEOUT = 60000; // 60 seconds
const CURSOR_HIDE_DELAY = 3000; // 3 seconds

export function useIdleReset(onReset: () => void) {
  const { reset } = useTotemFlow();

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    let cursorTimer: NodeJS.Timeout;
    let isKioskMode = false;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      clearTimeout(cursorTimer);
      document.body.classList.remove('kiosk-mode');
      
      if (isKioskMode) {
        cursorTimer = setTimeout(() => {
          document.body.classList.add('kiosk-mode');
        }, CURSOR_HIDE_DELAY);
      }

      idleTimer = setTimeout(() => {
        console.log('[Kiosk] Idle timeout - resetting');
        reset();
        onReset();
      }, IDLE_TIMEOUT);
    };

    const handleActivity = () => {
      resetIdleTimer();
    };

    const handleFullscreenChange = () => {
      isKioskMode = !!document.fullscreenElement;
      if (!isKioskMode) {
        // User exited fullscreen - could warn them
        console.log('[Kiosk] Exited fullscreen mode');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block ESC key to prevent exiting fullscreen
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      handleActivity();
    };

    // Prevent back navigation
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.href);
    };

    // Request fullscreen on mount
    const requestFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
        isKioskMode = true;
      } catch (err) {
        console.log('[Kiosk] Fullscreen not supported or denied');
      }
    };

    // Start listening
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('mousedown', handleActivity);
    document.addEventListener('touchstart', handleActivity);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('popstate', handlePopState);

    // Push initial state to prevent back
    window.history.pushState(null, '', window.location.href);

    // Request fullscreen
    requestFullscreen();

    // Start idle timer
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(cursorTimer);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('touchstart', handleActivity);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('popstate', handlePopState);
      document.body.classList.remove('kiosk-mode');
      
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [reset, onReset]);
}