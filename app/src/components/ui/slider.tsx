import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

/* The accessible name belongs on the thumb: that is the element with role="slider".
   The root is 44 px tall (WCAG 2.5.8 / Apple HIG touch target): a press anywhere on that band sets the value,
   while the visible track stays slim. */
function Slider({ className, 'aria-label': ariaLabel, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root data-slot="slider"
      className={cn('relative flex h-11 w-full touch-none items-center select-none data-[disabled]:opacity-50', className)} {...props}>
      <SliderPrimitive.Track className="bg-muted relative grow overflow-hidden rounded-full h-1.5">
        <SliderPrimitive.Range className="bg-primary absolute h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb aria-label={ariaLabel} className="border-primary bg-card ring-ring/50 block size-6 shrink-0 rounded-full border-2 shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden cursor-grab active:cursor-grabbing" />
    </SliderPrimitive.Root>
  )
}
export { Slider }
