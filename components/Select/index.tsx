'use client'

import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'

import buttonStyles from '@/components/Button/Button.module.css'

import styles from './Select.module.css'

interface Option {
  value: string
  label: string
}

interface SelectProps {
  options: Option[]
  label: string
  id: string
  value?: string
  onChange: (value: string) => void
  onCloseAutoFocus?: ComponentProps<
    typeof SelectPrimitive.Content
  >['onCloseAutoFocus']
  icon?: ReactNode
}

const Select = ({
  options,
  label,
  id,
  value,
  onChange,
  onCloseAutoFocus,
  icon,
}: SelectProps) => (
  <div className={styles.customSelect}>
    <SelectPrimitive.Root
      value={value}
      defaultValue={value === undefined ? options[0]?.value : undefined}
      onValueChange={onChange}>
      <SelectPrimitive.Trigger
        id={id}
        className={[
          buttonStyles.button,
          buttonStyles.gray,
          buttonStyles.small,
          styles.trigger,
        ].join(' ')}
        aria-label={label}>
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon className={styles.chevron}>
          <ChevronDown aria-hidden="true" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={styles.content}
          position="popper"
          sideOffset={4}
          onCloseAutoFocus={onCloseAutoFocus}>
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={styles.item}>
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className={styles.itemIndicator}>
                  <Check aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  </div>
)

export default Select
