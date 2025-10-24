import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, describe, it } from 'vitest'
import { AddElementButton } from '../AddElementButton'

describe('AddElementButton Component', () => {
  it('opens the add element dialog', async () => {
    const user = userEvent.setup()
    
    render(<AddElementButton />)

    const addButton = screen.getByTestId('add-element')
    expect(addButton).toBeVisible()

    await user.click(addButton)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeVisible()
  })
})