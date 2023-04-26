import Joi, {number} from "joi";

export default Joi.object().keys({
    service: Joi.string(),
    paymentMethod: Joi.string(),
    currency: Joi.string(),
    amount: Joi.number().min(0),
    payload: Joi.string()
});