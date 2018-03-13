import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import App from './components/App'
import TrashScheduleApp from './reducers'

let store = createStore(TrashScheduleApp)

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
)
