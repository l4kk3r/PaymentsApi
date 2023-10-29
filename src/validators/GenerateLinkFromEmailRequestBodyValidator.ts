import Joi, {number} from "joi";

export default Joi.object().keys({
    service: Joi.string(),
    paymentMethod: Joi.string(),
    planId: Joi.string(),
    email: Joi.string().email(),
    returnUrl: Joi.string()
});