const middleware = ({ dispatch }) => {
  return (_next) => {
    return async (_action) => {
      return _next(_action)
    }
  }
}

export { middleware }
