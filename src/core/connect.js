import React from 'react'
import {connect} from 'react-redux'
import {formChanged, formReset} from './action'


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
      formValues: state.msform[form || props.form],
      reduxState: state
    }),
    {
      formChanged,
      formReset
    }
  )
  (class FormComponent extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        // we keep here asyncValidationResults
        asyncValidation: {}
      }
    }

    // method to use when you want to save,
    formChanged = (values) => {
      this.props.formChanged(this.props.form, values)
    }

    formReset = (otherForm) => {
      this.props.formReset(otherForm || this.props.form)
    }

    asyncValidationResult = (asyncValidation) => {
      // set async validation result
      let res = mergeValidation(this.state.asyncValidation, asyncValidation)
      this.setState({asyncValidation: res})
    }

    /* get event and generate new form change change event */
    formGet = (...args) => {
      if (args.length === 4 && args[2] && args[2].props) {
        return this.formGetOnSelected(...args)
      }
      return this.formGetOnChange(...args)
    }

    /* get event and generate new form change change event */
    formGetOnChange = (ev) => {
      let val = {}

      if (typeof (ev) === "function") {
        val = ev()
      }
      else {
        let v = ev.target.type === "checkbox" ? ev.target.checked : ev.target.value
        val = {[ev.target.name]: v}
      }

      // assign values
      let o = this._getFormValues()
      let r = {...o, ...val}

      return r
    }

    formGetOnSelected = (value, text, field) => {
      return this.formGetOnChange(() => ({
        [field.props.name + "Text"]: text,
        [field.props.name]: value}
        ))
    }

    formField = (opts) => {
      let formValidation = this.formValidation;
      let formValues = this._getFormValues()
      let {showValidation, onChange, onSelected, skip} = opts

      return (name) => {

        let pr = {
          name,
          onChange: onChange || this._defaultOnChange,
          onSelected: onSelected || this._defaultOnSelected,
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
    }

    _defaultOnChange = (ev) => {
      let f = this.formGet(ev)
      // get formChanged
      this.formChanged(f)
    }

    _defaultOnSelected = (value, text, fld, lastValue) => {
      let f = this.formGet(value, text, fld, lastValue)
      // get formChanged
      this.formChanged(f)
    }

    _getFormValues = () => {
      return this.props.formValues || {
          // initialProps from connectForm parameter
          ...(typeof(initialValues) === 'function' ? initialValues(this.props.reduxState, this.props) : initialValues),
          // initialValues from property sent higher
          // not documented, not recommended way
          ...this.props.initialValues
        }
    }

    render() {
      let {} = this.state
      let {formChanged, formReset, ...props} = this.props

      let formValues = this._getFormValues()

      let formValidation = this.formValidation = {...(validate && validate(formValues, props)), ...this.state.asyncValidation}
      let formIsValid = this.formIsValid = Object.keys(formValidation).length === 0


      let rest = {
        // use it when you want to save form values to the state
        formChanged: this.formChanged,
        // when you want tot reset form
        formReset: this.formReset,
        // form values
        formValues,
        // form validation
        formValidation,
        // form isValid flag
        formIsValid,
        // after async validation call this function to send validation result to control.
        formAsyncValidationResult: this.asyncValidationResult,
        // function to get for
        formGet: this.formGet,
        formGetOnChange: this.formGetOnChange,
        formGetOnSelected: this.formGetOnSelected,
        formField: this.formField
      }

      // inject formValues, and formChanged handler
      return <Component {...props} {...rest} />
    }
  })
}
