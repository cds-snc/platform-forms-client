import React from 'react'
import { render, screen } from '@testing-library/react'
import { expect, describe, it } from 'vitest'
import { Formik } from 'formik'
import { FormattedDate } from './FormattedDate'
import { DateFormat } from './types'

describe('FormattedDate Component', () => {
  it('mounts successfully', () => {
    render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error('Function not implemented.')
        }}
      >
        <FormattedDate name="formattedDate" />
      </Formik>
    )

    expect(screen.getByTestId('formattedDate')).toBeInTheDocument()
    expect(screen.getByTestId('month-number')).toBeInTheDocument()
    expect(screen.getByTestId('year-number')).toBeInTheDocument()
    expect(screen.getByTestId('day-number')).toBeInTheDocument()

    // Default dateFormat is YYYY-MM-DD
    const formattedDateElement = screen.getByTestId('formattedDate')
    const dataTestIdElements = formattedDateElement.querySelectorAll('[data-testid]')
    expect(dataTestIdElements[0]).toHaveAttribute('data-testid', 'year-number')
    expect(dataTestIdElements[1]).toHaveAttribute('data-testid', 'month-number')
    expect(dataTestIdElements[2]).toHaveAttribute('data-testid', 'day-number')
  })

  it('sets date format to DD-MM-YYYY', () => {
    render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error('Function not implemented.')
        }}
      >
        <FormattedDate name="formattedDate" dateFormat="DD-MM-YYYY" />
      </Formik>
    )

    expect(screen.getByTestId('formattedDate')).toBeInTheDocument()
    const formattedDateElement = screen.getByTestId('formattedDate')
    const dataTestIdElements = formattedDateElement.querySelectorAll('[data-testid]')
    expect(dataTestIdElements[0]).toHaveAttribute('data-testid', 'day-number')
    expect(dataTestIdElements[1]).toHaveAttribute('data-testid', 'month-number')
    expect(dataTestIdElements[2]).toHaveAttribute('data-testid', 'year-number')
  })

  it('sets date format to MM-DD-YYYY', () => {
    render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error('Function not implemented.')
        }}
      >
        <FormattedDate name="formattedDate" dateFormat="MM-DD-YYYY" />
      </Formik>
    )

    expect(screen.getByTestId('formattedDate')).toBeInTheDocument()
    const formattedDateElement = screen.getByTestId('formattedDate')
    const dataTestIdElements = formattedDateElement.querySelectorAll('[data-testid]')
    expect(dataTestIdElements[0]).toHaveAttribute('data-testid', 'month-number')
    expect(dataTestIdElements[1]).toHaveAttribute('data-testid', 'day-number')
    expect(dataTestIdElements[2]).toHaveAttribute('data-testid', 'year-number')
  })

  it('sets date format to YYYY-MM-DD', () => {
    render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error('Function not implemented.')
        }}
      >
        <FormattedDate name="formattedDate" dateFormat="YYYY-MM-DD" />
      </Formik>
    )

    expect(screen.getByTestId('formattedDate')).toBeInTheDocument()
    const formattedDateElement = screen.getByTestId('formattedDate')
    const dataTestIdElements = formattedDateElement.querySelectorAll('[data-testid]')
    expect(dataTestIdElements[0]).toHaveAttribute('data-testid', 'year-number')
    expect(dataTestIdElements[1]).toHaveAttribute('data-testid', 'month-number')
    expect(dataTestIdElements[2]).toHaveAttribute('data-testid', 'day-number')
  })

  it('defaults to YYYY-MM-DD when dateFormat is invalid', () => {
    render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error('Function not implemented.')
        }}
      >
        <FormattedDate name="formattedDate" dateFormat={'XXXX-XX-XX' as unknown as DateFormat} />
      </Formik>
    )

    expect(screen.getByTestId('formattedDate')).toBeInTheDocument()
    const formattedDateElement = screen.getByTestId('formattedDate')
    const dataTestIdElements = formattedDateElement.querySelectorAll('[data-testid]')
    expect(dataTestIdElements[0]).toHaveAttribute('data-testid', 'year-number')
    expect(dataTestIdElements[1]).toHaveAttribute('data-testid', 'month-number')
    expect(dataTestIdElements[2]).toHaveAttribute('data-testid', 'day-number')
  })

  it('renders a legend for the fieldset', () => {
    render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error('Function not implemented.')
        }}
      >
        <FormattedDate name="formattedDate" label="Enter a date" />
      </Formik>
    )

    const formattedDateElement = screen.getByTestId('formattedDate')
    const legend = formattedDateElement.querySelector('legend')
    expect(legend).toBeInTheDocument()
    expect(legend).toHaveTextContent('Enter a date')
  })

  it('sets autocomplete bday for the inputs', () => {
    render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error('Function not implemented.')
        }}
      >
        <FormattedDate name="formattedDate" autocomplete="bday" />
      </Formik>
    )

    expect(screen.getByTestId('year-number')).toHaveAttribute('autocomplete', 'bday-year')
    expect(screen.getByTestId('month-number')).toHaveAttribute('autocomplete', 'bday-month')
    expect(screen.getByTestId('day-number')).toHaveAttribute('autocomplete', 'bday-day')
  })

  it('adds aria-describedby description', () => {
    render(
      <Formik
        initialValues={{}}
        onSubmit={() => {
          throw new Error('Function not implemented.')
        }}
      >
        <FormattedDate
          name="formattedDate"
          label="Enter a date"
          description="This is a description"
        />
      </Formik>
    )

    expect(screen.getByTestId('formattedDate')).toHaveAttribute('aria-roledescription')
    expect(screen.getByTestId('formattedDate')).toHaveAttribute('aria-labelledby')
    expect(screen.getByTestId('description')).toBeInTheDocument()
    expect(screen.getByTestId('description')).toHaveTextContent('This is a description')
  })
})