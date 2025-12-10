import { useEffect, RefObject } from 'react';

/**
 * Hook to make elements touch-friendly
 * Ensures touch events trigger the same actions as click events
 * Adds minimum touch target size (44x44px recommended by WCAG)
 */

interface UseTouchFriendlyOptions {
  minSize?: number; // Minimum touch target size in pixels
  onInteraction?: () => void; // Callback for both click and touch
}

/**
 * Make an element touch-friendly by ensuring proper sizing and event handling
 * 
 * @param ref - React ref to the element
 * @param options - Configuration options
 */
export function useTouchFriendly(
  ref: RefObject<HTMLElement>,
  options: UseTouchFriendlyOptions = {}
) {
  const { minSize = 44, onInteraction } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Ensure minimum touch target size
    const computedStyle = window.getComputedStyle(element);
    const width = parseInt(computedStyle.width);
    const height = parseInt(computedStyle.height);

    if (width < minSize || height < minSize) {
      console.warn(
        `Touch target too small: ${width}x${height}px. Recommended minimum: ${minSize}x${minSize}px`,
        element
      );
    }

    // Handle touch events
    const handleTouchStart = (e: TouchEvent) => {
      // Prevent default to avoid double-firing with click
      // But allow scrolling
      if (e.touches.length === 1) {
        element.classList.add('touch-active');
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      element.classList.remove('touch-active');
      
      // Trigger interaction callback
      if (onInteraction && e.touches.length === 0) {
        e.preventDefault();
        onInteraction();
      }
    };

    const handleTouchCancel = () => {
      element.classList.remove('touch-active');
    };

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchCancel);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [ref, minSize, onInteraction]);
}

/**
 * Check if the current device supports touch
 */
export function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * Get recommended touch target size based on device
 */
export function getRecommendedTouchSize(): number {
  // WCAG 2.1 Level AAA recommends 44x44px
  // iOS Human Interface Guidelines recommend 44x44pt
  // Material Design recommends 48x48dp
  return 44;
}
