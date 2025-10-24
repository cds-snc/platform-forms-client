import React from 'react'
import { render } from '@testing-library/react'
import { expect, describe, it, vi } from 'vitest'
import { TextFieldOptions } from '../TextFieldOptions'
import { FormElementTypes } from '@lib/types'

describe('TextFieldOptions Component', () => {
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

    render(<TextFieldOptions item={item} setItem={setItemSpy} />)

    // Basic mount test - if no error thrown, component mounted successfully
    expect(true).toBe(true)
  })
})