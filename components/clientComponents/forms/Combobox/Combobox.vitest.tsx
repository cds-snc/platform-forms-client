import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, describe, it } from 'vitest'
import { Combobox } from './Combobox'
import { Formik } from 'formik'

const ComboboxWrapper = ({ initialValue = '', choices = ['one', 'two', 'three', 'four', 'five'] }) => (
  <Formik
    initialValues={{ combobox: initialValue }}
    onSubmit={() => {
      throw new Error('Function not implemented.')
    }}
  >
    <Combobox name="combobox" choices={choices} />
  </Formik>
)

describe('Combobox Component', () => {
  it('mounts correctly', () => {
    render(<ComboboxWrapper />)

    expect(screen.getByTestId('combobox')).toBeInTheDocument()
    expect(screen.getByTestId('combobox-input')).toBeInTheDocument()
    expect(screen.getByTestId('combobox-listbox')).toBeInTheDocument()
    expect(screen.getByTestId('combobox-listbox')).not.toBeVisible()
  })

  it('filters list based on input', async () => {
    const user = userEvent.setup()
    render(<ComboboxWrapper />)

    const input = screen.getByTestId('combobox-input')
    const listbox = screen.getByTestId('combobox-listbox')

    // Click to open listbox
    await user.click(input)
    expect(listbox).toBeVisible()

    // Type "o" to filter
    await user.type(input, 'o')
    await waitFor(() => {
      const items = screen.queryAllByRole('option')
      expect(items).toHaveLength(3) // "one", "two", "four"
    })

    // Type "n" to further filter
    await user.type(input, 'n')
    await waitFor(() => {
      const items = screen.queryAllByRole('option')
      expect(items).toHaveLength(1) // "one"
    })
  })

  it('keyboard navigates the list', async () => {
    const user = userEvent.setup()
    render(<ComboboxWrapper />)

    const input = screen.getByTestId('combobox-input')

    // Focus the input first
    await user.click(input)
    
    // Open listbox with down arrow and navigate to first option
    await user.keyboard('{ArrowDown}')
    
    await waitFor(() => {
      const firstOption = screen.getByRole('option', { name: 'one' })
      expect(firstOption).toHaveAttribute('aria-selected', 'true')
    })

    // Navigate to second option
    await user.keyboard('{ArrowDown}')
    await waitFor(() => {
      const secondOption = screen.getByRole('option', { name: 'two' })
      expect(secondOption).toHaveAttribute('aria-selected', 'true')
    })

    // Navigate to third option  
    await user.keyboard('{ArrowDown}')
    await waitFor(() => {
      const thirdOption = screen.getByRole('option', { name: 'three' })
      expect(thirdOption).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('selects option with Enter key', async () => {
    const user = userEvent.setup()
    render(<ComboboxWrapper />)

    const input = screen.getByTestId('combobox-input') as HTMLInputElement

    // Focus the input first
    await user.click(input)

    // Open listbox and navigate to second option
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    
    await waitFor(() => {
      const secondOption = screen.getByRole('option', { name: 'two' })
      expect(secondOption).toHaveAttribute('aria-selected', 'true')
    })

    // Select with Enter
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(input.value).toBe('two')
    })
  })

  it('selects option by clicking', async () => {
    const user = userEvent.setup()
    render(<ComboboxWrapper />)

    const input = screen.getByTestId('combobox-input') as HTMLInputElement

    // Click to open listbox
    await user.click(input)
    
    // Click on "three" option
    await waitFor(() => {
      const thirdOption = screen.getByRole('option', { name: 'three' })
      expect(thirdOption).toBeVisible()
    })
    
    const thirdOption = screen.getByRole('option', { name: 'three' })
    await user.click(thirdOption)
    
    await waitFor(() => {
      expect(input.value).toBe('three')
    })
  })

  it('closes listbox on escape key', async () => {
    const user = userEvent.setup()
    render(<ComboboxWrapper />)

    const input = screen.getByTestId('combobox-input')
    const listbox = screen.getByTestId('combobox-listbox')

    // Open listbox
    await user.click(input)
    expect(listbox).toBeVisible()

    // Close with Escape
    await user.type(input, '{Escape}')
    await waitFor(() => {
      expect(listbox).not.toBeVisible()
    })
  })

  it('handles empty choices array', () => {
    render(<ComboboxWrapper choices={[]} />)

    const input = screen.getByTestId('combobox-input')
    expect(input).toBeInTheDocument()
    
    // Should not crash with empty choices
    fireEvent.click(input)
    
    const options = screen.queryAllByRole('option')
    expect(options).toHaveLength(0)
  })
})