import React from 'react'
import Simple from './forms/simple'
import InitialValues from './forms/initialValues'
import SyncValidation from './forms/syncValidation'
import AsyncValidation from './forms/asyncValidation'

export default function(props) {
  return (
    <div style={{width:300, margin: 'auto'}}>

      <h2>MS-Form</h2>
      <p>
        check console to see state changes
      </p>

      <h3>Simple</h3>
      <a href="https://github.com/Maintstar/ms-form/blob/master/src/doc/forms/simple.js">source</a>
      <Simple />

      <h3>Initial Values</h3>
      <a href="https://github.com/Maintstar/ms-form/blob/master/src/doc/forms/initialValues.js">source</a>
      <InitialValues />

      <h3>Sync Validation</h3>
      <a href="https://github.com/Maintstar/ms-form/blob/master/src/doc/forms/syncValidation.js">source</a>
      <SyncValidation />

      <h3>Async Validation</h3>
      <a href="https://github.com/Maintstar/ms-form/blob/master/src/doc/forms/asyncValidation.js">source</a>
      <AsyncValidation />

    </div>
  )
}
