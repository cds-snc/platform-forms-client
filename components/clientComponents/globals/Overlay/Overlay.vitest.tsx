import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, describe, it } from 'vitest'
import { Overlay } from './Overlay'

describe('Overlay Component', () => {
  it('opens and shows as expected', () => {
    render(<Overlay />)

    expect(screen.getByTestId('overlay')).toBeVisible()
  })

  it('clicking executes the passed callback', async () => {
    const user = userEvent.setup()
    let callbackCalled = false
    
    const callback = () => {
      callbackCalled = true
    }

    render(<Overlay callback={callback} />)

    const overlay = screen.getByTestId('overlay')
    expect(overlay).toBeVisible()
    
    await user.click(overlay)
    
    expect(callbackCalled).toBe(true)
  })
})