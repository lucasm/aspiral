import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import type { ReactElement } from 'react'

import styles from './Tooltip.module.css'

interface TooltipProps {
  text: string
  children: ReactElement
  disable?: boolean
}

const Tooltip = ({ text, children, disable = false }: TooltipProps) => {
  if (disable) {
    return children
  }
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            className={styles.tooltip}
            side="bottom"
            sideOffset={8}>
            {text}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

export default Tooltip
