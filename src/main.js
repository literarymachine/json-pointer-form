import ReactDOM from 'react-dom'
import React from 'react'
import App from './App'
import { Composer } from '../lib'

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<App />, document.getElementById('mount'))
})
