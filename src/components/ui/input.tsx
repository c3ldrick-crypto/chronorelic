import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?:   string
  error?:   string
  icon?:    React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-[#94a3b8]">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "w-full rounded-xl border border-[#1e1e42] bg-[#0e0e24] px-4 py-2.5 text-sm text-[#e2e8f0] placeholder:text-[#475569]",
              "transition-all duration-200",
              "focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20",
              "hover:border-[#2e2e52]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon && "pl-10",
              error && "border-red-500/60 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
