"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require('dotenv').config();
var inversify_config_1 = require("../src/di/inversify.config");
var types_1 = require("../src/di/types");
var User_1 = __importDefault(require("../src/models/User"));
var crypto_1 = require("crypto");
var Payment_1 = __importDefault(require("../src/models/Payment"));
var luxon_1 = require("luxon");
var GetPlanById_1 = __importDefault(require("../src/utils/GetPlanById"));
var Subscription_1 = __importDefault(require("../src/models/Subscription"));
var RandomHex_1 = __importDefault(require("../src/utils/RandomHex"));
jest.setTimeout(60000);
var DEFAULT_PAYMENT_URL = 'https://yoomoney.ru/checkout/payments/v';
var PLAN_ID = 'ok_vpn_1_month';
var PAYMENT_METHOD = 'yookassa';
var RENEWAL_BONUS = 7 * 24;
describe('Payment service tests', function () {
    var paymentService = inversify_config_1.container.get(types_1.TYPES.PaymentService);
    var repository = inversify_config_1.container.get(types_1.TYPES.Repository);
    it('Create payment', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, parameters, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = new User_1.default(0, (0, crypto_1.randomInt)(0, 1000), (0, crypto_1.randomUUID)());
                    return [4 /*yield*/, repository.createUser(user)];
                case 1:
                    _a.sent();
                    parameters = {
                        userId: user.id,
                        planId: PLAN_ID,
                        paymentMethod: PAYMENT_METHOD,
                        returnUrl: 'return'
                    };
                    return [4 /*yield*/, paymentService.generatePayment(parameters)
                        // Assert
                    ];
                case 2:
                    result = _a.sent();
                    // Assert
                    expect(result.link.startsWith(DEFAULT_PAYMENT_URL)).toBeTruthy();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Create payment from email', function () { return __awaiter(void 0, void 0, void 0, function () {
        var email, parameters, result, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    email = 'l4kk3r@yandex.ru';
                    parameters = {
                        planId: PLAN_ID,
                        paymentMethod: PAYMENT_METHOD,
                        email: email,
                        returnUrl: 'return'
                    };
                    return [4 /*yield*/, paymentService.generatePaymentFromEmail(parameters)
                        // Assert
                    ];
                case 1:
                    result = _a.sent();
                    // Assert
                    expect(result.startsWith(DEFAULT_PAYMENT_URL)).toBeTruthy();
                    return [4 /*yield*/, repository.getUserByEmail(email)];
                case 2:
                    user = _a.sent();
                    expect(user).not.toBeNull();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Confirm payment with new subscription', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, payment, secret, paymentAfterConfirmation, messageBroker, message, subscription, plan, dif, paymentDetails;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = new User_1.default(0, (0, crypto_1.randomInt)(1, 1000000), (0, crypto_1.randomUUID)(), null);
                    return [4 /*yield*/, repository.createUser(user)];
                case 1:
                    _a.sent();
                    payment = new Payment_1.default(0, 149, user.id, null, PLAN_ID, 'new');
                    return [4 /*yield*/, repository.createPayment(payment)];
                case 2:
                    _a.sent();
                    secret = (0, crypto_1.randomUUID)();
                    // Act
                    return [4 /*yield*/, paymentService.confirmPayment({
                            uuid: (0, crypto_1.randomUUID)(),
                            paymentId: payment.id,
                            amount: 149,
                            currency: 'RUB',
                            paymentDetails: {
                                billingProvider: PAYMENT_METHOD,
                                paymentMethod: 'card',
                                secret: secret,
                                isSaved: true
                            }
                        })
                        // Assert
                    ];
                case 3:
                    // Act
                    _a.sent();
                    return [4 /*yield*/, repository.getPaymentById(payment.id)];
                case 4:
                    paymentAfterConfirmation = _a.sent();
                    expect(paymentAfterConfirmation.status).toBe('paid');
                    expect(paymentAfterConfirmation.paidAt).not.toBeNull();
                    messageBroker = inversify_config_1.container.get(types_1.TYPES.MessageBroker);
                    return [4 /*yield*/, messageBroker.getLatestMessage(false)];
                case 5:
                    message = _a.sent();
                    expect(message).not.toBeNull();
                    expect(message.subscriptionId).not.toBeNull();
                    expect(message.type).toBe('new');
                    return [4 /*yield*/, repository.getSubscriptionById(message.subscriptionId)];
                case 6:
                    subscription = _a.sent();
                    plan = (0, GetPlanById_1.default)(subscription.planId);
                    expect(subscription.userId).toBe(user.id);
                    expect(subscription.planId).toBe(PLAN_ID);
                    dif = subscription.endAt.diff(luxon_1.DateTime.utc().plus(luxon_1.Duration.fromISO(plan.duration)), 'hours').hours;
                    expect(dif < 1).toBeTruthy();
                    return [4 /*yield*/, repository.getPaymentDetailsByUserId(user.id)];
                case 7:
                    paymentDetails = _a.sent();
                    expect(paymentDetails.length).toBe(1);
                    expect(paymentDetails[0].userId).toBe(user.id);
                    expect(paymentDetails[0].secret).toBe(secret);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Confirm payment with renew subscription', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, subscription, payment, paymentAfterConfirmation, messageBroker, message, subscriptionRenewed, plan, dif;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = new User_1.default(0, (0, crypto_1.randomInt)(1, 1000000), (0, crypto_1.randomUUID)());
                    return [4 /*yield*/, repository.createUser(user)];
                case 1:
                    _a.sent();
                    subscription = new Subscription_1.default(0, user.id, PLAN_ID, luxon_1.DateTime.utc(), luxon_1.DateTime.utc(), false, (0, RandomHex_1.default)());
                    return [4 /*yield*/, repository.createSubscription(subscription)];
                case 2:
                    _a.sent();
                    payment = new Payment_1.default(0, 149, user.id, subscription.id, PLAN_ID, 'renew');
                    return [4 /*yield*/, repository.createPayment(payment)
                        // Act
                    ];
                case 3:
                    _a.sent();
                    // Act
                    return [4 /*yield*/, paymentService.confirmPayment({
                            uuid: (0, crypto_1.randomUUID)(),
                            paymentId: payment.id,
                            amount: 149,
                            currency: 'RUB',
                            paymentDetails: {
                                billingProvider: PAYMENT_METHOD
                            }
                        })
                        // Assert
                    ];
                case 4:
                    // Act
                    _a.sent();
                    return [4 /*yield*/, repository.getPaymentById(payment.id)];
                case 5:
                    paymentAfterConfirmation = _a.sent();
                    expect(paymentAfterConfirmation.status).toBe('paid');
                    expect(paymentAfterConfirmation.paidAt).not.toBeNull();
                    messageBroker = inversify_config_1.container.get(types_1.TYPES.MessageBroker);
                    return [4 /*yield*/, messageBroker.getLatestMessage(false)];
                case 6:
                    message = _a.sent();
                    expect(message).not.toBeNull();
                    expect(message.subscriptionId).toBe(subscription.id);
                    expect(message.type).toBe('renew');
                    return [4 /*yield*/, repository.getSubscriptionById(subscription.id)];
                case 7:
                    subscriptionRenewed = _a.sent();
                    plan = (0, GetPlanById_1.default)(PLAN_ID);
                    dif = subscriptionRenewed.endAt.diff(subscription.endAt.plus(luxon_1.Duration.fromISO(plan.duration)), 'hours').hours;
                    expect(dif < RENEWAL_BONUS + 1).toBeTruthy();
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=payment.test.js.map