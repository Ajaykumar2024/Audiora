import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState({
    isVisible: false,
    type: 'info', // 'success' | 'error' | 'info'
    message: '',
  });

  const timerRef = useRef(null);

  // Manual dismiss
  const hideNotification = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setNotification((prev) => ({ ...prev, isVisible: false }));
  }, []);

  // Show notification with automatic dismiss timer
  const showNotification = useCallback((type = 'info', message = '', duration = 5500) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setNotification({
      isVisible: true,
      type,
      message,
    });

    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setNotification((prev) => ({ ...prev, isVisible: false }));
        timerRef.current = null;
      }, duration);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to trigger or hide notifications
export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

/**
 * Reusable full-width notification banner matching the exact design:
 * Icon on left, message in center, dismiss X button on right.
 * Red theme for error, emerald theme for success.
 */
export function NotificationBanner({ className = 'mb-6' }) {
  const { notification, hideNotification } = useNotification();

  if (!notification?.isVisible || !notification.message) return null;

  const isError = notification.type === 'error';

  return (
    <div
      className={`p-4 rounded-xl flex items-center justify-between gap-3 transition-all animate-in fade-in duration-200 ${isError
          ? 'bg-red-950/60 border border-red-500/40 text-red-300'
          : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
        } ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-3 min-w-0">
        {isError ? (
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
        ) : (
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
        )}
        <div className="text-sm font-medium leading-snug break-words">
          {notification.message}
        </div>
      </div>
      <button
        type="button"
        onClick={hideNotification}
        className={`p-1.5 rounded-lg transition shrink-0 cursor-pointer ${isError
            ? 'text-red-400/80 hover:text-red-100 hover:bg-red-900/50'
            : 'text-emerald-400/80 hover:text-emerald-100 hover:bg-emerald-900/50'
          }`}
        title="Dismiss notification"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
