class ExpressError extends Error{
    constructor(msg, scode){
        super();
        this.message = msg;
        this.statusCode = scode;
    }
}

module.exports = ExpressError;