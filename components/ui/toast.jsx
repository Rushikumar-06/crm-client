import * as ToastPrimitive from '@radix-ui/react-toast';
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const showToast = useCallback((msg) => {
    setMessage(msg);
    setOpen(false);
    setTimeout(() => setOpen(true), 10);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastPrimitive.Provider swipeDirection="right">
        <ToastPrimitive.Root open={open} onOpenChange={setOpen} className="fixed bottom-6 right-6 bg-white border shadow-lg rounded-lg px-4 py-3 z-50">
          <ToastPrimitive.Title className="font-medium">{message}</ToastPrimitive.Title>
        </ToastPrimitive.Root>
        <ToastPrimitive.Viewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
} 