import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring cursor-pointer",
  {
    variants: {
      variant: {
        default: 'btn-glow bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-[0_12px_34px_-8px_color-mix(in_oklch,var(--primary)_80%,transparent)] active:translate-y-0',
        outline: 'btn-glow border bg-card hover:border-primary hover:text-primary hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-12px_color-mix(in_oklch,var(--primary)_60%,transparent)] active:translate-y-0',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        destructive: 'btn-glow bg-destructive text-white hover:bg-destructive/90',
      },
      size: {
        default: 'h-11 px-6 has-[>svg]:px-5',
        sm: 'h-9 px-4 text-[0.84rem] has-[>svg]:px-3',
        lg: 'h-12 px-8',
        icon: 'size-11 rounded-full',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

function Button({
  className, variant, size, asChild = false, ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
