import * as React from "react"
import { cn } from "@/lib/utils"

export interface SimpleSwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const SimpleSwitch = React.forwardRef<HTMLInputElement, SimpleSwitchProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative inline-flex h-6 w-11 items-center">
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="peer sr-only"
          {...props}
        />
        <span
          className={cn(
            "absolute inset-0 cursor-pointer rounded-full bg-gray-300 transition-colors peer-checked:bg-primary",
            className
          )}
        />
        <span
          className={cn(
            "absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"
          )}
        />
      </div>
    )
  }
)
SimpleSwitch.displayName = "SimpleSwitch"

export { SimpleSwitch } 