const Joi = require('joi');
const AppError = require('../utils/errorHandle/appError');

const signUpValidateMethod = Joi.object({
    firstName: Joi.string()
        .alphanum()
        .min(2)
        .max(30)
        .required()
        .error((errors) => {
            errors.forEach((err) => {
                switch(err.code) {
                    case 'string.empty':
                        err.message = 'username should not be empty';
                        break;
                    case 'string.min':
                        err.message = `username should have at least ${err.local.min} characters`;
                        break;
                    case 'string.max':
                        err.message = `username should have at most ${err.local.limit} characters!`;
                    break;
                default:
                    break;
                }
            });
            return errors;
        }),
    password: Joi.string()
    .regex(/^[a-zA-Z0-9]{6,30}$/)
    .required()
    .error(
        new AppError('invalid password , must contain at least 6 characters', 400)
    ),
    
    client_email: Joi.string()
    .email({
        minDomainSegments: 2,
        tlds: { allow: ['com', 'net'] },
    })
    .required()
    .error(
        new AppError('invalid password , must contain at least 6 characters', 400)
    ),
    lastName: Joi.string(),
})
const classSchema = Joi.object({
    subject: Joi.string().empty(),
    max_students: Joi.number().empty(),
    from: Joi.date(),
    to: Joi.date(),
    status: Joi.string().valid('open', 'close', 'pending').default('pending'),
}).custom((obj, helper) => {
    const {to, from } = obj;
    if(new Date(from) > new Date(to)) {
        throw new Error('end date must be greater than start date');
    }
    if(new Date(from) < new Date()) {
        throw new Error('start date must be greater than today');
    }
    return obj;
})

const updateMeSchema = Joi.object({
    client_id: [Joi.number(),Joi.string()],
    phonenumber: [Joi.string(),Joi.number().empty()],
    age: Joi.number().min(1).max(100).empty(),
})
exports.signUpValidate = async (req, res, next) => {
    try {
      await signUpValidateMethod.validateAsync(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };

exports.updateMeValidate = async(req, res,next) => {
    try{
        await updateMeSchema.validateAsync(req.body);
        next();
    }catch (err) {
        next(err);
    }
}

exports.classValidate = async(req, res,next) => {
    try{
        await classSchema.validateAsync(req.body);
        next();
    }catch (err) {
        next(err);
    }
}