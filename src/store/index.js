import { createStore, applyMiddleware, compose } from 'redux'
import { middleware } from '../middleware'
import thunk from 'redux-thunk'
import { combineReducers } from 'redux'

const rootReducer = combineReducers({})

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(rootReducer, storeEnhancers(applyMiddleware(middleware, thunk)))

export default store
