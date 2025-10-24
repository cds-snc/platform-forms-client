import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, describe, it, vi } from 'vitest'
import { RequiredOptions } from '../RequiredOptions'
import { FormElementTypes } from '@lib/types'

describe('RequiredOptions Component', () => {
  const item = {
    id: 1,
    type: FormElementTypes.textField,
    properties: {
      subElements: [],
      choices: [
        {
          en: '',
          fr: '',
        },
      ],
      titleEn: 'Short answer',
      titleFr: '',
      validation: {
        required: false,
      },
      descriptionEn: '',
      descriptionFr: '',
      placeholderEn: '',
      placeholderFr: '',
    },
    index: 0,
    questionNumber: 0,
  }

  it('mounts successfully', () => {
    const setItemSpy = vi.fn()

    render(<RequiredOptions item={item} setItem={setItemSpy} />)

    // Check that the component rendered
    expect(screen.getByTestId('required')).toBeInTheDocument()
  })

  it('sets Required to true when clicked', async () => {
    const user = userEvent.setup()
    const setItemSpy = vi.fn()

    render(<RequiredOptions item={item} setItem={setItemSpy} />)
    
    const requiredCheckbox = screen.getByTestId('required')
    await user.click(requiredCheckbox)
    
    expect(setItemSpy).toHaveBeenCalledWith({
      ...item,
      properties: { ...item.properties, validation: { required: true } },
    })
  })

  it('sets Required to false when clicked again', async () => {
    const user = userEvent.setup()
    const setItemSpy = vi.fn()
    
    // Start with required: true
    const requiredItem = {
      ...item,
      properties: { ...item.properties, validation: { required: true } },
    }

    render(<RequiredOptions item={requiredItem} setItem={setItemSpy} />)
    
    const requiredCheckbox = screen.getByTestId('required')
    await user.click(requiredCheckbox)
    
    expect(setItemSpy).toHaveBeenCalledWith({
      ...requiredItem,
      properties: { ...requiredItem.properties, validation: { required: false } },
    })
  })
})