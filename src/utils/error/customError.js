class CustomError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = 'CustomError';
  }
}

export default CustomError;
