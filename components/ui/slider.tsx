'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      // py-2.5 enlarges the clickable/draggable area so the thin track is easy to grab.
      'relative flex w-full touch-none select-none items-center py-2.5 cursor-pointer',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className="relative h-1.5 w-full grow overflow-hidden rounded-full"
      style={{ background: '#26262b' }}
    >
      <SliderPrimitive.Range className="absolute h-full" style={{ background: '#7aa2f7' }} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        'block h-5 w-5 rounded-full transition-transform hover:scale-110 active:scale-105',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7aa2f7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0d]',
        'disabled:pointer-events-none disabled:opacity-50',
        // Invisible expanded hit area for easier touch/mouse grabbing.
        "relative cursor-grab active:cursor-grabbing before:absolute before:-inset-2.5 before:content-['']",
      )}
      style={{ background: '#7aa2f7', border: '3px solid #0b0b0d', boxShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
