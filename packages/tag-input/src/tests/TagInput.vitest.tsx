import React from 'react'
import { render, screen } from '@testing-library/react'
import { expect, describe, it } from 'vitest'
import { TagInput } from '../TagInput'

describe('TagInput Component', () => {
  it('renders without crashing', () => {
    render(
      <div>
        <TagInput initialTags={[]} />
      </div>
    )

    // Basic mount test - if no error thrown, component rendered successfully
    expect(true).toBe(true)
  })

  it('accepts initial tags', () => {
    render(
      <div>
        <TagInput
          initialTags={['Tag one', 'Tag two', 'Tag three']}
          onTagAdd={() => {}}
          onTagRemove={() => {}}
        />
      </div>
    )

    const tags = document.querySelectorAll('.gc-tag')
    expect(tags).toHaveLength(3)
    expect(screen.getByText('Tag one')).toBeInTheDocument()
    expect(screen.getByText('Tag two')).toBeInTheDocument()
    expect(screen.getByText('Tag three')).toBeInTheDocument()
  })

  it('sets the name attribute', () => {
    render(
      <div>
        <TagInput initialTags={[]} name="test-name" />
      </div>
    )

    const tagInput = screen.getByTestId('tag-input')
    expect(tagInput).toHaveAttribute('name', 'test-name')
  })

  it('adds a custom label', () => {
    render(
      <div>
        <TagInput initialTags={[]} label="Custom Label" />
      </div>
    )

    const label = document.querySelector('.gc-tag-input-label')
    expect(label).toBeInTheDocument()
    expect(label).toHaveTextContent('Custom Label')
  })
})