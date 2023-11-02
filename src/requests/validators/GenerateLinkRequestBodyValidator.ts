import Joi, {number} from "joi";

export default Joi.object().keys({
    userId: Joi.number().required(),
    planId: Joi.string().required(),
    paymentMethod: Joi.string().required(),
    subscriptionId: Joi.number().optional().allow(null),
    returnUrl: Joi.string().required()
});