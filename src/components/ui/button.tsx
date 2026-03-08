"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08081a] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:   "btn-primary px-6 py-2.5",
        gold:      "btn-gold px-6 py-2.5",
        outline:   "border border-[#1e1e42] bg-transparent text-[#e2e8f0] hover:border-violet-500 hover:bg-violet-500/10 px-6 py-2.5",
        ghost:     "bg-transparent text-[#94a3b8] hover:bg-[#1e1e42] hover:text-[#e2e8f0] px-4 py-2",
        destructive: "bg-red-600/80 text-white hover:bg-red-600 border border-red-500/30 px-6 py-2.5",
        link:      "text-violet-400 underline-offset-4 hover:underline px-0 py-0 h-auto",
        mythique:  "bg-gradient-to-r from-pink-600 to-violet-600 text-white border border-pink-500/30 hover:shadow-[0_0_24px_rgba(236,72,153,0.5)] px-6 py-2.5",
      },
      size: {
        sm:      "h-8 px-4 text-xs",
        default: "h-10",
        lg:      "h-12 px-8 text-base",
        xl:      "h-14 px-10 text-lg",
        icon:    "h-10 w-10 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Chargement...</span>
          </>
        ) : children}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
