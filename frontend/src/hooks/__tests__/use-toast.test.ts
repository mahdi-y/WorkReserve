/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../use-toast';

describe('useToast', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.dismiss(); 
    });
  });

  it('provides toast function and empty toasts initially', () => {
    const { result } = renderHook(() => useToast());
    
    expect(typeof result.current.toast).toBe('function');
    expect(result.current.toasts).toEqual([]);
    expect(typeof result.current.dismiss).toBe('function');
  });

  it('adds toast when toast function is called', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'This is a test',
      });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: 'Test Toast',
      description: 'This is a test',
      open: true,
    });
    expect(result.current.toasts[0].id).toBeDefined();
  });

  it('adds multiple toasts or replaces existing toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
    });
    
    act(() => {
      result.current.toast({ title: 'Toast 2' });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Toast 2');
  });

  it('sets toast open state to false when dismissed by id', () => {
    const { result } = renderHook(() => useToast());
    
    let toastId: string;
    
    act(() => {
      const toast = result.current.toast({ title: 'Test Toast' });
      toastId = toast.id;
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(true);
    
    act(() => {
      result.current.dismiss(toastId);
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('dismisses all toasts when no id provided', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(true);
    
    act(() => {
      result.current.dismiss();
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('handles different toast variants', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Error Toast',
        variant: 'destructive',
      });
    });
    
    expect(result.current.toasts[0].variant).toBe('destructive');
  });

  it('shows toast with duration but does not auto-dismiss', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Duration Toast',
        duration: 1000,
      });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].duration).toBe(1000);
    
  });

  it('returns toast object with update and dismiss methods', () => {
    const { result } = renderHook(() => useToast());
    
    let toastObject: any;
    
    act(() => {
      toastObject = result.current.toast({ title: 'Test Toast' });
    });
    
    expect(typeof toastObject.update).toBe('function');
    expect(typeof toastObject.dismiss).toBe('function');
    expect(toastObject.id).toBeDefined();
  });

  it('updates toast when update method is called', () => {
    const { result } = renderHook(() => useToast());
    
    let toastObject: any;
    
    act(() => {
      toastObject = result.current.toast({ title: 'Original Title' });
    });
    
    act(() => {
      toastObject.update({ title: 'Updated Title' });
    });
    
    expect(result.current.toasts[0].title).toBe('Updated Title');
  });
});