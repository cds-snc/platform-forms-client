import React from 'react'
import { render } from '@testing-library/react'
import { expect, describe, it, vi } from 'vitest'
import { AddressCompleteOptions } from '../AddressCompleteOptions'
import { TemplateStoreProvider } from '@lib/store/useTemplateStore'
import { FormElementTypes } from '@lib/types'

describe('AddressCompleteOptions Component', () => {
  const item = {
    id: 1,
    type: FormElementTypes.addressComplete,
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
        <AddressCompleteOptions item={item} setItem={setItemSpy} />
      </TemplateStoreProvider>
    )

    // Basic mount test - if no error thrown, component mounted successfully
    expect(true).toBe(true)
  })
})