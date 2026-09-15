import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col gap-6', className)} {...props} />
}
function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn('inline-flex w-fit items-center justify-center gap-1 rounded-full bg-muted p-1', className)} {...props} />
}
function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" className={cn(
    "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300 cursor-pointer hover:scale-[1.03] active:scale-100",
    'text-muted-foreground hover:text-foreground',
    'data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm',
    'focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none disabled:opacity-50',
    "[&_svg:not([class*='size-'])]:size-4", className)} {...props} />
}
function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn('flex-1 outline-none', className)} {...props} />
}
export { Tabs, TabsList, TabsTrigger, TabsContent }
