import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-all",
  {
    variants: {
      variant: {
        default:     "bg-violet-500/20 text-violet-300 border border-violet-500/30",
        gold:        "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        outline:     "border border-[#1e1e42] text-[#94a3b8]",
        destructive: "bg-red-500/20 text-red-300 border border-red-500/30",
        success:     "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        commune:     "bg-slate-600/20 text-slate-300 border border-slate-600/30",
        rare:        "bg-blue-500/20 text-blue-300 border border-blue-500/30",
        epique:      "bg-violet-500/20 text-violet-300 border border-violet-500/30",
        legendaire:  "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        mythique:    "bg-pink-500/20 text-pink-300 border border-pink-500/30 animate-pulse-slow",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
