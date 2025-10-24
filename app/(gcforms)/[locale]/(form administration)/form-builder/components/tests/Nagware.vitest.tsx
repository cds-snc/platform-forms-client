import React from 'react'
import { render, screen } from '@testing-library/react'
import { expect, describe, it } from 'vitest'
import { Nagware } from '../Nagware'
import { NagLevel } from '@lib/types'

describe('Nagware Component', () => {
  it('renders UnsavedOver35Days', () => {
    render(
      <Nagware
        nagwareResult={{
          level: NagLevel.UnsavedSubmissionsOver35DaysOld,
          numberOfSubmissions: 5,
        }}
      />
    )

    const alert = screen.getByRole('alert')
    const numberOfSubmissions = screen.getByTestId('numberOfSubmissions')

    expect(alert).toHaveClass('bg-red-50')
    expect(numberOfSubmissions).toHaveTextContent('5')
  })

  it('renders UnconfirmedOver35Days', () => {
    render(
      <Nagware
        nagwareResult={{
          level: NagLevel.UnconfirmedSubmissionsOver35DaysOld,
          numberOfSubmissions: 3,
        }}
      />
    )

    const alert = screen.getByRole('alert')
    const numberOfSubmissions = screen.getByTestId('numberOfSubmissions')

    expect(alert).toHaveClass('bg-red-50')
    expect(numberOfSubmissions).toHaveTextContent('3')
  })

  it('renders UnsavedOver21Days', () => {
    render(
      <Nagware
        nagwareResult={{
          level: NagLevel.UnsavedSubmissionsOver21DaysOld,
          numberOfSubmissions: 1,
        }}
      />
    )

    const alert = screen.getByRole('alert')
    const numberOfSubmissions = screen.getByTestId('numberOfSubmissions')

    expect(alert).toHaveClass('bg-yellow-50')
    expect(numberOfSubmissions).toHaveTextContent('1')
  })

  it('renders UnconfirmedOver21Days', () => {
    render(
      <Nagware
        nagwareResult={{
          level: NagLevel.UnconfirmedSubmissionsOver21DaysOld,
          numberOfSubmissions: 2,
        }}
      />
    )

    const alert = screen.getByRole('alert')
    const numberOfSubmissions = screen.getByTestId('numberOfSubmissions')

    expect(alert).toHaveClass('bg-yellow-50')
    expect(numberOfSubmissions).toHaveTextContent('2')
  })
})