import Joi, {number} from "joi";

export default Joi.object().keys({
    planId: Joi.string().required(),
    paymentMethod: Joi.string().required(),
    email: Joi.string().email().required(),
    returnUrl: Joi.string().required()
});