"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const http_status_codes_1 = require("http-status-codes");
const response_helper_1 = require("../utils/helper/response_helper");
const validate = (schema) => {
    return (req, res, next) => {
        const errors = {};
        const { error } = schema.validate({
            body: req.body,
            params: req.params,
            query: req.query,
            headers: req.headers,
        }, { abortEarly: false, allowUnknown: true });
        if (error) {
            error.details.forEach((err) => {
                // Normalize field path: strip the first segment (body/params/query/headers)
                const field = err.path.length > 1
                    ? String(err.path.slice(1).join("."))
                    : String(err.path[0] || "unknown");
                if (!errors[field])
                    errors[field] = [];
                errors[field].push(err.message.replace(/"/g, ""));
            });
            (0, response_helper_1.errorResponse)(res, "error.validationFailed", errors, http_status_codes_1.StatusCodes.BAD_REQUEST);
            return;
        }
        next();
    };
};
exports.validate = validate;
