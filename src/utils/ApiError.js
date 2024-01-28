class ApiError extends Error {
  constructor(message = "Something went wrong", statusCode,errors = [], stack = "") {
    super(message);
    this.status = statusCode;
    this.data = null
    this.error = errors;
    this.success = false;

    if (stack) {
      this.stack = stack;
    }else{
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;