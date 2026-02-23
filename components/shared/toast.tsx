'use client';

import { useState } from 'react';
import { useToast, type Toast as ToastType } from '@/lib/hooks/use-toast';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  
  const handleDismiss = () => {
    setIsExiting(true);
    // Wait for animation to complete before removing
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };
  
  // Get icon and colors based on toast type
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          textColor: 'text-green-800',
          iconColor: 'text-green-500',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-500',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-500',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          ),
        };
    }
  };
  
  const styles = getToastStyles();
  
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-lg
        ${styles.bgColor} ${styles.borderColor}
        transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
        animate-slide-in
        min-w-[300px] max-w-md
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 ${styles.iconColor}`}>
        {styles.icon}
      </div>
      
      {/* Message */}
      <div className={`flex-1 ${styles.textColor} text-sm font-medium`}>
        {toast.message}
        
        {/* Action button */}
        {toast.action && (
          <button
            onClick={() => {
              toast.action!.onClick();
              handleDismiss();
            }}
            className={`
              mt-2 px-3 py-1 rounded text-xs font-semibold ms-2
              ${toast.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : ''}
              ${toast.type === 'info' ? 'bg-primary hover:bg-primary-dark text-white' : ''}
              ${toast.type === 'success' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
              ${toast.type === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
              transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white
            `}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className={`flex-shrink-0 ${styles.textColor} hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${toast.type === 'success' ? 'green' : toast.type === 'error' ? 'red' : toast.type === 'warning' ? 'yellow' : 'blue'}-500 rounded`}
        aria-label="Dismiss notification"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

/**
 * ToastContainer Component
 * 
 * Displays toast notifications in the top-right corner of the screen.
 * Supports multiple simultaneous toasts with auto-dismiss and manual dismiss.
 * 
 * @example
 * // Add to your root layout
 * <ToastContainer />
 * 
 * // Use the hook to show toasts
 * const { showToast } = useToast();
 * showToast({ type: 'success', message: 'Operation successful!' });
 */
export function ToastContainer() {
  const { toasts, dismissToast } = useToast();
  
  if (toasts.length === 0) {
    return null;
  }
  
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={dismissToast} />
        </div>
      ))}
    </div>
  );
}
