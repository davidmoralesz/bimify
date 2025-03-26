"use client"

import type * as React from "react"
import { MinusIcon, PlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CounterProps {
  className?: string
  value: number
  min?: number
  max?: number
  step?: number
  options?: number[]
  onChange: (value: number) => void
  disabled?: boolean
}

export function Counter({
  className,
  value,
  min = 0,
  max = 100,
  step = 1,
  options,
  onChange,
  disabled = false,
  ...props
}: CounterProps & React.HTMLAttributes<HTMLDivElement>) {
  const handleDecrement = () => {
    if (options) {
      const currentIndex = options.indexOf(value)
      if (currentIndex > 0) {
        onChange(options[currentIndex - 1])
      }
    } else {
      const newValue = Math.max(min, value - step)
      onChange(newValue)
    }
  }

  const handleIncrement = () => {
    if (options) {
      const currentIndex = options.indexOf(value)
      if (currentIndex < options.length - 1) {
        onChange(options[currentIndex + 1])
      }
    } else {
      const newValue = Math.min(max, value + step)
      onChange(newValue)
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)} {...props}>
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={handleDecrement}
          disabled={disabled || (options ? options.indexOf(value) <= 0 : value <= min)}
        >
          <MinusIcon className="h-6 w-6" />
          <span className="sr-only">Decrease</span>
        </Button>
        <div className="mx-8 text-center">
          <span className="text-7xl font-light tabular-nums">{value}</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={handleIncrement}
          disabled={disabled || (options ? options.indexOf(value) >= options.length - 1 : value >= max)}
        >
          <PlusIcon className="h-6 w-6" />
          <span className="sr-only">Increase</span>
        </Button>
      </div>

      {/* {options && (
        <div className="flex w-full justify-center gap-1 overflow-x-auto py-2">
          {options.map((option) => (
            <div
              key={option}
              className={cn("h-12 w-4 rounded-sm bg-muted transition-all", value === option && "bg-primary")}
              onClick={() => !disabled && onChange(option)}
              style={{
                height: `${Math.min(100, Math.max(20, option / 2))}px`,
                cursor: disabled ? "default" : "pointer",
              }}
            />
          ))}
        </div>
      )} */}
    </div>
  )
}

