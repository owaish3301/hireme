export type Options = {
    code? : string,
    statusCode? : number,
    isOperational? : boolean,
}

export default class AppError extends Error{
    code? : string
    statusCode? : number
    isOperational : boolean;

    constructor(msg:string, options:Options){
        super(msg);
        this.name = this.constructor.name;
        this.code = options.code;
        this.statusCode = options.statusCode;
        this.isOperational = options.isOperational ?? true;
    }
}