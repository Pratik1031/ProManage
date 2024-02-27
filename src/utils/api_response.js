class api_response {
  constructor(statusCode, data, message = "sucess") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.sucess = statusCode < 400;
  }
}

module.exports = api_response;
