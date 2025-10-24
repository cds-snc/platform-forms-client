import React from 'react'
import { render, screen } from '@testing-library/react'
import { expect, describe, it } from 'vitest'
import { Alert } from '../../globals'
import { Button } from '../../globals'

describe('Alert Component', () => {
  describe('Alerts by status', () => {
    it('renders a SUCCESS alert', () => {
      render(<Alert.Success title="This is a title" body="This is a body" />)
      
      const alert = screen.getByTestId('alert')
      expect(alert).toBeVisible()
      expect(alert).toHaveClass('bg-emerald-50')
      
      const alertIcon = screen.getByTestId('alert-icon')
      expect(alertIcon).toHaveClass('[&_svg]:fill-emerald-700')
      
      const alertHeading = screen.getByTestId('alert-heading')
      expect(alertHeading).toHaveClass('text-emerald-700')
    })

    it('renders a WARNING alert', () => {
      render(<Alert.Warning title="This is a title" body="This is a body" />)
      
      const alert = screen.getByTestId('alert')
      expect(alert).toBeVisible()
      expect(alert).toHaveClass('bg-yellow-50')
      
      const alertIcon = screen.getByTestId('alert-icon')
      expect(alertIcon).toHaveClass('[&_svg]:fill-yellow-700')
      
      const alertHeading = screen.getByTestId('alert-heading')
      expect(alertHeading).toHaveClass('text-slate-950')
    })

    it('renders an INFO alert', () => {
      render(<Alert.Info title="This is a title" body="This is a body" />)
      
      const alert = screen.getByTestId('alert')
      expect(alert).toBeVisible()
      expect(alert).toHaveClass('bg-indigo-50')
      
      const alertIcon = screen.getByTestId('alert-icon')
      expect(alertIcon).toHaveClass('[&_svg]:fill-slate-950')
      
      const alertHeading = screen.getByTestId('alert-heading')
      expect(alertHeading).toHaveClass('text-slate-950')
    })

    it('renders a DANGER alert', () => {
      render(<Alert.Danger title="This is a title" body="This is a body" />)
      
      const alert = screen.getByTestId('alert')
      expect(alert).toBeVisible()
      expect(alert).toHaveClass('bg-red-50')
      
      const alertIcon = screen.getByTestId('alert-icon')
      expect(alertIcon).toHaveClass('[&_svg]:fill-red-700')
      
      const alertHeading = screen.getByTestId('alert-heading')
      expect(alertHeading).toHaveClass('text-red-700')
    })
  })

  describe('Alerts using props', () => {
    it('renders a basic alert with title and body', () => {
      render(
        <Alert.Success
          title="This is a title"
          body="This is a body"
        />
      )
      
      expect(screen.getByTestId('alert')).toBeVisible()
      expect(screen.getByText('This is a title')).toBeVisible()
      expect(screen.getByText('This is a body')).toBeVisible()
    })

    it('renders alert with JSX children', () => {
      render(
        <Alert.Info title="Alert with JSX">
          <div>
            <p>This is a paragraph</p>
            <Button theme="link">Click me</Button>
          </div>
        </Alert.Info>
      )
      
      expect(screen.getByText('Alert with JSX')).toBeVisible()
      expect(screen.getByText('This is a paragraph')).toBeVisible()
      expect(screen.getByRole('button', { name: 'Click me' })).toBeVisible()
    })
  })
})