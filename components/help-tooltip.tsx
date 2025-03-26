import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CircleHelp } from "lucide-react"

interface HelpTooltipProps {
  children?: React.ReactNode
  tip: string
}

export default function HelpTooltip({ children, tip }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {children ? (
            children
          ) : (
            <CircleHelp className="size-4" strokeWidth={2} />
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-52 text-center">{tip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
