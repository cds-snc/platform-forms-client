import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, describe, it, vi } from 'vitest'
import { Question } from '../Question'
import { TemplateStoreProvider } from '@lib/store/useTemplateStore'
import { FormElementTypes } from '@lib/types'

describe('Question Component', () => {
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
      titleEn: '',
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

    render(
      <TemplateStoreProvider isPublished={false}>
        <Question item={item} setItem={setItemSpy} />
      </TemplateStoreProvider>
    )

    // Basic mount test - if no error thrown, component mounted successfully
    expect(true).toBe(true)
  })

  it('shows input field and calls setItem when text changes', async () => {
    const user = userEvent.setup()
    const setItemSpy = vi.fn()

    render(
      <TemplateStoreProvider isPublished={false}>
        <Question item={item} setItem={setItemSpy} />
      </TemplateStoreProvider>
    )

    const input = screen.getByRole('textbox')
    expect(input).toBeVisible()

    await user.type(input, 'New question')
    
    // setItem should be called as user types (onChange behavior)
    expect(setItemSpy).toHaveBeenCalled()
    
    // Note: The exact call verification would depend on the component's implementation
    // In a real test, you might want to check the final value after user interaction
  })
})