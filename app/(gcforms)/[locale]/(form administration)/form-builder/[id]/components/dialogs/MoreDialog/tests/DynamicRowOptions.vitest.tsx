import React from 'react'
import { render } from '@testing-library/react'
import { expect, describe, it, vi } from 'vitest'
import { DynamicRowOptions } from '../DynamicRowOptions'
import { TemplateStoreProvider } from '@lib/store/useTemplateStore'
import { FormElementTypes } from '@lib/types'

describe('DynamicRowOptions Component', () => {
  const item = {
    id: 1,
    type: FormElementTypes.dynamicRow,
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
        <DynamicRowOptions item={item} setItem={setItemSpy} />
      </TemplateStoreProvider>
    )

    // Basic mount test - if no error thrown, component mounted successfully
    expect(true).toBe(true)
  })
})