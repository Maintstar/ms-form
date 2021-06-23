import React, { useState, useMemo, useCallback } from 'react'
import { connect } from 'react-redux'
import { formChanged, formReset } from './action'

export function mergeValidation(prevValidation, newValidation) {

  let resValidation = {...prevValidation, ...newValidation}
  Object.keys(resValidation).forEach(k => {
    if (resValidation[k] == null) delete resValidation[k]
  })
  return resValidation;
}

export default function ({form, validate, initialValues}) {
  return Component => connect(
    (state, props) => ({
      form: form || props.form,
      formValues: state.msform[form || props.form]
    }),
    {
      formChanged,
      formReset
    }
  )
  (function FormComponent(props) {
    const { formChanged, formReset, form, reduxState } = props;
    // we keep here asyncValidationResults
    const [asyncValidation, setAsyncValidation] = useState(() => ({}));

    const formValues = useMemo(() => {
      return props.formValues || {
        // initialProps from connectForm parameter
        ...(typeof(initialValues) === 'function' ? initialValues(reduxState, props) : initialValues),
        // initialValues from property sent higher
        // not documented, not recommended way
        ...initialValues
      }
    }, [initialValues, reduxState, props])

    const formValidation = useMemo(() => ({
      ...(validate && validate(formValues, props)),
      ...asyncValidation
    }), [formValues, asyncValidation, props])

    // method to use when you want to save,
    const newFormChanged = useCallback((values) => {
      formChanged(form, values)
    }, [formChanged, form])

    const newFormReset = useCallback((otherForm) => {
      formReset(otherForm || form)
    }, [form, formReset])

    const asyncValidationResult = useCallback((newAsyncValidation) => {
      // set async validation result
      let res = mergeValidation(asyncValidation, newAsyncValidation)
      setAsyncValidation(res)
    }, [asyncValidation])

    /* get event and generate new form change change event */
    const formGetOnChange = useCallback((ev) => {
      let val = {}

      if (typeof (ev) === "function") {
        val = ev()
      }
      else {
        let v = ev.target.type === "checkbox" ? ev.target.checked : ev.target.value
        val = {[ev.target.name]: v}
      }

      return { ...formValues, ...val }
    }, [formValues])

    const formGetOnSelected = useCallback((value, text, field) => {
      return formGetOnChange(() => ({
          [field.props.name + "Text"]: text,
          [field.props.name]: value}
      ))
    }, [formGetOnChange])

    /* get event and generate new form change change event */
    const formGet = useCallback((...args) => {
      if (args.length === 4 && args[2] && args[2].props) {
        return formGetOnSelected(...args)
      }
      return formGetOnChange(...args)
    }, [formGetOnSelected, formGetOnChange])

    const _defaultOnChange = useCallback((ev) => {
      let f = formGet(ev)
      // get formChanged
      newFormChanged(f)
    }, [formGet, newFormChanged])

    const _defaultOnSelected = useCallback((value, text, fld, lastValue) => {
      let f = formGet(value, text, fld, lastValue)
      // get formChanged
      newFormChanged(f)
    }, [formGet, newFormChanged])

    const formField = useCallback((opts) => {
      let {showValidation, onChange, onSelected, skip} = opts

      return (name) => {
        let pr = {
          name,
          onChange: onChange || _defaultOnChange,
          onSelected: onSelected || _defaultOnSelected,
          // fill value property
          value: formValues[name] || formValues[name] === 0 ? formValues[name] : ""
        }
        // fill text property, MS field specific
        if (formValues[name + "Text"] != null) pr["text"] = formValues[name + "Text"]

        // send error prop to field
        if ((showValidation || showValidation == null) && formValidation[name] != null) pr["error"] = formValidation[name]

        // skip unneded properties
        if (skip) {
          if (Array.isArray(skip)) {
            // skip
            skip.forEach(p => delete pr[p])
          } else {
            console.error("'skip' option, should be an array")
          }
        }

        return pr
      }
    }, [_defaultOnChange, _defaultOnSelected, formValidation, formValues])

    const formIsValid = Object.keys(formValidation).length === 0

    const rest = {
      // use it when you want to save form values to the state
      formChanged: newFormChanged,
      // when you want tot reset form
      formReset: newFormReset,
      // form values
      formValues,
      // form validation
      formValidation,
      // form isValid flag
      formIsValid,
      // after async validation call this function to send validation result to control.
      formAsyncValidationResult: asyncValidationResult,
      // function to get for
      formGet: formGet,
      formGetOnChange: formGetOnChange,
      formGetOnSelected: formGetOnSelected,
      formField: formField
    }

    // inject formValues, and formChanged handler
    return <Component {...props} {...rest} />
  })
}
