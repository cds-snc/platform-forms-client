import React from 'react'
import classnames from 'classnames'

interface ButtonProps {
  type: 'button' | 'submit' | 'reset'
  children: React.ReactNode
  secondary?: boolean
  base?: boolean
  size?: 'big'
  /**
   * @deprecated since 1.6.0, use size
   */
  big?: boolean
  /**
   * @deprecated since 1.6.0, use size
   */
  small?: boolean
  /**
   * @deprecated since 1.9.0
   */
  icon?: boolean
  unstyled?: boolean
}

export const Button = (
  props: ButtonProps & JSX.IntrinsicElements['button']
): React.ReactElement => {
  const {
    type,
    children,
    secondary,
    base,
    size,
    unstyled,
    onClick,
    className,
    ...defaultProps
  } = props

  const classes = classnames(
    'gc-button',
    {
      'gc-button--secondary': secondary,
      'gc-button--base': base
    },
    className
  )

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      data-testid="button"
      {...defaultProps}>
      {children}
    </button>
  )
}

export default Button
