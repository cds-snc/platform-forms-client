import React from 'react'
import { render, fireEvent } from '@testing-library/react'

import { Button } from './Button'

describe('Button component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without errors', () => {
    const { queryByTestId } = render(<Button type="button">Click Me</Button>)
    expect(queryByTestId('button')).toBeInTheDocument()
  })

  describe('renders uswds classes', () => {
    it('gc-button', () => {
      const { queryByTestId } = render(<Button type="button">Click Me</Button>)
      expect(queryByTestId('button')).toHaveClass('gc-button')
    })

    const optionalBooleanClasses = [
      ['secondary', 'gc-button--secondary'],
      ['base', 'gc-button--base'],
      ['accent', 'gc-button--accent-cool'],
      ['outline', 'gc-button--outline'],
      ['inverse', 'gc-button--inverse'],
      ['unstyled', 'gc-button--unstyled'],
    ]

    optionalBooleanClasses.map((data) => {
      it(`${data[1]}`, () => {
        const additionalProps: { [key: string]: boolean } = {}
        additionalProps[data[0]] = true

        const { queryByTestId } = render(
          <Button type="button" {...additionalProps}>
            Click Me
          </Button>
        )
        expect(queryByTestId('button')).toHaveClass(data[1])
      })
    })
  })

  it('implements an onClick handler', () => {
    const onClickFn = jest.fn()
    const { getByText } = render(
      <Button type="button" onClick={onClickFn}>
        Click Me
      </Button>
    )

    fireEvent.click(getByText('Click Me'))
    expect(onClickFn).toHaveBeenCalledTimes(1)
  })

  it('accepts additional custom class names', () => {
    const { getByTestId } = render(
      <Button className="customClass" type="button">
        Click Me
      </Button>
    )
    expect(getByTestId('button')).toHaveClass('gc-button')
    expect(getByTestId('button')).toHaveClass('customClass')
  })
})
