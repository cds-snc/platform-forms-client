import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, describe, it, vi } from 'vitest'
import { PanelActions } from '../PanelActions'
import { FormElementTypes } from '@lib/types'

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

describe('PanelActions Component', () => {
  it('enables move buttons for item that is not first or last', () => {
    render(
      <PanelActions
        item={item}
        isFirstItem={false}
        isLastItem={false}
        totalItems={0}
        handleAdd={vi.fn()}
        handleRemove={vi.fn()}
        handleMoveUp={vi.fn()}
        handleMoveDown={vi.fn()}
        handleDuplicate={vi.fn()}
      />
    )

    const moveUpButton = screen.getByTestId('moveUp')
    const moveDownButton = screen.getByTestId('moveDown')
    
    expect(moveUpButton).not.toBeDisabled()
    expect(moveDownButton).not.toBeDisabled()
  })

  it('disables move buttons for first and last item', () => {
    render(
      <PanelActions
        item={item}
        isFirstItem={true}
        isLastItem={true}
        totalItems={0}
        handleAdd={vi.fn()}
        handleRemove={vi.fn()}
        handleMoveUp={vi.fn()}
        handleMoveDown={vi.fn()}
        handleDuplicate={vi.fn()}
      />
    )

    const moveUpButton = screen.getByTestId('moveUp')
    const moveDownButton = screen.getByTestId('moveDown')
    const duplicateButton = screen.getByTestId('duplicate')
    const removeButton = screen.getByTestId('remove')
    const moreButton = screen.getByTestId('more')

    // Move buttons should be disabled
    expect(moveUpButton).toBeDisabled()
    expect(moveUpButton).toHaveAttribute('tabindex', '-1')
    expect(moveDownButton).toBeDisabled()
    expect(moveDownButton).toHaveAttribute('tabindex', '-1')

    // Other buttons should not be disabled
    expect(duplicateButton).not.toBeDisabled()
    expect(duplicateButton).toHaveAttribute('tabindex', '0')
    expect(removeButton).not.toBeDisabled()
    expect(removeButton).toHaveAttribute('tabindex', '-1')
    expect(moreButton).not.toBeDisabled()
    expect(moreButton).toHaveAttribute('tabindex', '-1')
  })

  it('can keyboard navigate through buttons', async () => {
    const user = userEvent.setup()
    
    render(
      <div className="active group">
        <PanelActions
          item={item}
          isFirstItem={false}
          isLastItem={false}
          totalItems={0}
          handleAdd={vi.fn()}
          handleRemove={vi.fn()}
          handleMoveUp={vi.fn()}
          handleMoveDown={vi.fn()}
          handleDuplicate={vi.fn()}
        />
      </div>
    )

    // Tab to first button
    await user.tab()
    expect(screen.getByTestId('moveUp')).toHaveFocus()

    // Navigate right through buttons
    await user.keyboard('{ArrowRight}')
    expect(screen.getByTestId('moveDown')).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByTestId('duplicate')).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByTestId('remove')).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByTestId('more')).toHaveFocus()

    // Navigate left
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByTestId('remove')).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByTestId('duplicate')).toHaveFocus()
  })

  it('calls handler functions when buttons are clicked', async () => {
    const user = userEvent.setup()
    const handleMoveUp = vi.fn()
    const handleMoveDown = vi.fn()
    const handleDuplicate = vi.fn()
    const handleRemove = vi.fn()

    render(
      <PanelActions
        item={item}
        isFirstItem={false}
        isLastItem={false}
        totalItems={0}
        handleAdd={vi.fn()}
        handleRemove={handleRemove}
        handleMoveUp={handleMoveUp}
        handleMoveDown={handleMoveDown}
        handleDuplicate={handleDuplicate}
      />
    )

    await user.click(screen.getByTestId('moveUp'))
    expect(handleMoveUp).toHaveBeenCalled()

    await user.click(screen.getByTestId('moveDown'))
    expect(handleMoveDown).toHaveBeenCalled()

    await user.click(screen.getByTestId('duplicate'))
    expect(handleDuplicate).toHaveBeenCalled()

    await user.click(screen.getByTestId('remove'))
    expect(handleRemove).toHaveBeenCalled()
  })
})