import React from 'react'
import classnames from 'classnames'

import { TextInput, OptionalTextInputProps } from '../TextInput/TextInput'
import { Label } from '../Label/Label'
import { FormGroup } from '../FormGroup/FormGroup'

interface DateInputElementProps {
  id: string
  name: string
  label: string
  unit: 'month' | 'day' | 'year'
  maxLength: number
  minLength?: number
}

export const DateInput = (
  props: DateInputElementProps & OptionalTextInputProps
): React.ReactElement => {
  const {
    id,
    name,
    label,
    unit,
    maxLength,
    minLength,
    className,
    ...inputProps
  } = props

  const formGroupClasses = classnames({
    'gc-form-group--month': unit == 'month',
    'gc-form-group--day': unit == 'day',
    'gc-form-group--year': unit == 'year',
  })

  const inputClasses = classnames('gc-input--inline', className)

  return (
    <FormGroup className={formGroupClasses}>
      <Label htmlFor={id}>{label}</Label>
      <TextInput
        {...inputProps}
        className={inputClasses}
        id={id}
        name={name}
        type="text"
        maxLength={maxLength}
        minLength={minLength}
        pattern="[0-9]*"
        inputMode="numeric"
      />
    </FormGroup>
  )
}

export default DateInput
