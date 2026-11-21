import { Link } from '@/i18n/routing'

import Styles from './Button.module.css'

type BaseProps = {
  url?: string
  color?: 'colors' | 'black' | 'white' | 'gray' | 'transparent'
  size?: 'small' | 'medium' | 'large' | 'big'
  external?: boolean
  children?: React.ReactNode
  className?: string
}

type LinkProps = BaseProps &
  Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'children' | 'className' | 'color' | 'href' | 'rel' | 'size' | 'target'
  > & {
    url: string
  }

type NativeButtonProps = BaseProps &
  Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'children' | 'className' | 'size' | 'type'
  > & {
    url?: undefined
    type?: 'button' | 'submit' | 'reset'
  }

type Props = LinkProps | NativeButtonProps

export default function Button({
  url,
  external,
  color,
  size,
  children,
  className,
  ...rest
}: Readonly<Props>) {
  const colorKey = color ?? 'white'
  const sizeKey = size ?? 'small'
  const normalizedSize = sizeKey === 'big' ? 'large' : sizeKey
  const resolvedClassName = [
    Styles.button,
    Styles[colorKey],
    Styles[normalizedSize],
    className,
  ]
    .join(' ')
    .trim()

  if (url) {
    const linkProps = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>

    return (
      <Link
        {...linkProps}
        href={url}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={resolvedClassName}>
        {children}
      </Link>
    )
  }

  const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>
  const { type = 'button' } = buttonProps

  return (
    <button
      {...buttonProps}
      type={type}
      className={resolvedClassName}>
      {children}
    </button>
  )
}
