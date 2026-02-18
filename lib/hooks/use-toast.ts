import { useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: ToastAction;
}

interface ToastOptions {
  type: ToastType;
  message: string;
  duration?: number; // in milliseconds, default 4000ms (4 seconds)
  action?: ToastAction;
}

let toastCounter = 0;
const listeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

function generateId(): string {
  return `toast-${Date.now()}-${toastCounter++}`;
}

function emitChange() {
  listeners.forEach((listener) => listener([...toasts]));
}

export function addToast(options: ToastOptions): string {
  const id = generateId();
  const duration = options.duration ?? 4000; // Default 4 seconds
  
  const toast: Toast = {
    id,
    type: options.type,
    message: options.message,
    duration,
    action: options.action,
  };
  
  toasts = [...toasts, toast];
  emitChange();
  
  // Auto-dismiss after duration
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
  
  return id;
}

export function removeToast(id: string): void {
  toasts = toasts.filter((toast) => toast.id !== id);
  emitChange();
}

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);
  
  useEffect(() => {
    listeners.add(setCurrentToasts);
    return () => {
      listeners.delete(setCurrentToasts);
    };
  }, []);
  
  const showToast = useCallback((options: ToastOptions) => {
    return addToast(options);
  }, []);
  
  const dismissToast = useCallback((id: string) => {
    removeToast(id);
  }, []);
  
  return {
    toasts: currentToasts,
    showToast,
    dismissToast,
  };
}
