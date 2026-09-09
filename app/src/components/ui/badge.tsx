import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium w-fit whitespace-nowrap shrink-0 gap-1.5 tracking-wide',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground',
        a: 'border-grade-a/30 bg-grade-a/10 text-grade-a',
        b: 'border-grade-b/30 bg-grade-b/10 text-grade-b',
        c: 'border-grade-c/30 bg-grade-c/10 text-grade-c',
        d: 'border-grade-d/30 bg-grade-d/10 text-grade-d',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

function Badge({ className, variant, asChild = false, ...props }:
  React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}
export { Badge, badgeVariants }
