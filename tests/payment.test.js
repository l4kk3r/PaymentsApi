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
var inversify_config_1 = require("../src/di/inversify.config");
var types_1 = require("../src/di/types");
var User_1 = __importDefault(require("../src/models/User"));
var crypto_1 = require("crypto");
var Payment_1 = __importDefault(require("../src/models/Payment"));
var luxon_1 = require("luxon");
var GetPlanById_1 = __importDefault(require("../src/utils/GetPlanById"));
var Subscription_1 = __importDefault(require("../src/models/Subscription"));
var RandomHex_1 = __importDefault(require("../src/utils/RandomHex"));
var PaymentType_1 = __importDefault(require("../src/models/enums/PaymentType"));
var PaymentStatus_1 = __importDefault(require("../src/models/enums/PaymentStatus"));
var AutoRenewStatus_1 = __importDefault(require("../src/models/enums/AutoRenewStatus"));
var PaymentDetails_1 = __importDefault(require("../src/models/PaymentDetails"));
var PaymentMessage_1 = __importDefault(require("../src/models/messages/PaymentMessage"));
var FailedSubscriptionAutoRenewMessage_1 = __importDefault(require("../src/models/messages/FailedSubscriptionAutoRenewMessage"));
jest.setTimeout(60000);
var DEFAULT_PAYMENT_URL = 'https://yoomoney.ru/checkout/payments/v';
var PLAN = (0, GetPlanById_1.default)('ok_vpn_1_month');
var PAYMENT_METHOD = 'yookassa';
var PAYMENT_SECRET = '2ce3592b-000f-5000-9000-1c9faff77b0a';
var RENEWAL_BONUS_DAYS = 7;
var paymentService = inversify_config_1.container.get(types_1.TYPES.PaymentService);
var repository = inversify_config_1.container.get(types_1.TYPES.Repository);
var messageBroker = inversify_config_1.container.get(types_1.TYPES.MessageBroker);
var warmupMs = 1000;
describe('Payment service tests', function () {
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(function () { return resolve(1); }, warmupMs); })];
                case 1:
                    _a.sent();
                    messageBroker.purgeAll();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Create payment', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, parameters, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createUser()];
                case 1:
                    user = _a.sent();
                    parameters = {
                        userId: user.id,
                        planId: PLAN.id,
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
                        planId: PLAN.id,
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
    it('Confirm payment with new subscription and saved payment method', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, payment, secret, paymentParameters, paymentAfterConfirmation, subscription, expectedMessage, plan, dif, paymentDetails;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, createPayment(user, PaymentType_1.default.New)];
                case 2:
                    payment = _a.sent();
                    secret = (0, crypto_1.randomUUID)();
                    paymentParameters = createPaymentParameters(payment, secret);
                    // Act
                    return [4 /*yield*/, paymentService.confirmPayment(paymentParameters)
                        // Assert
                    ];
                case 3:
                    // Act
                    _a.sent();
                    return [4 /*yield*/, repository.getPaymentById(payment.id)];
                case 4:
                    paymentAfterConfirmation = _a.sent();
                    expect(paymentAfterConfirmation.status).toBe(PaymentStatus_1.default.Paid);
                    expect(paymentAfterConfirmation.paidAt).not.toBeNull();
                    return [4 /*yield*/, getUserSubscription(user)];
                case 5:
                    subscription = _a.sent();
                    expectedMessage = new PaymentMessage_1.default(subscription.id, payment.type);
                    return [4 /*yield*/, expectPaymentMessageToBeEqual(expectedMessage)];
                case 6:
                    _a.sent();
                    plan = (0, GetPlanById_1.default)(subscription.planId);
                    expect(subscription.userId).toBe(user.id);
                    expect(subscription.planId).toBe(PLAN.id);
                    dif = Math.abs(subscription.endAt.diff(luxon_1.DateTime.utc().plus(luxon_1.Duration.fromISO(plan.duration)), 'hours').hours);
                    expect(dif < 1).toBeTruthy();
                    return [4 /*yield*/, repository.getPaymentDetailsByUserId(user.id)];
                case 7:
                    paymentDetails = _a.sent();
                    expect(paymentDetails).not.toBeNull();
                    expect(paymentDetails.userId).toBe(user.id);
                    expect(paymentDetails.secret).toBe(secret);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Confirm payment with renew subscription', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, subscription, payment, paymentParameters, paymentAfterConfirmation, expectedMessage, renewedSubscription;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, createSubscription(user)];
                case 2:
                    subscription = _a.sent();
                    return [4 /*yield*/, createPayment(user, PaymentType_1.default.Renew, subscription)];
                case 3:
                    payment = _a.sent();
                    paymentParameters = createPaymentParameters(payment);
                    // Act
                    return [4 /*yield*/, paymentService.confirmPayment(paymentParameters)
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
                    expectedMessage = new PaymentMessage_1.default(subscription.id, payment.type);
                    return [4 /*yield*/, expectPaymentMessageToBeEqual(expectedMessage)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, repository.getSubscriptionById(subscription.id)];
                case 7:
                    renewedSubscription = _a.sent();
                    expectSubscriptionToBeRenewed(renewedSubscription, subscription.endAt);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Auto renew subscription', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, paymentDetails, subscription, renewJob, renewedSubscription, payment, expectedMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, createPaymentDetails(user, PAYMENT_SECRET)];
                case 2:
                    paymentDetails = _a.sent();
                    return [4 /*yield*/, createSubscription(user, AutoRenewStatus_1.default.Enabled)];
                case 3:
                    subscription = _a.sent();
                    renewJob = inversify_config_1.container.get(types_1.TYPES.RenewJob);
                    // Act
                    return [4 /*yield*/, renewJob.run()
                        // Assert
                    ];
                case 4:
                    // Act
                    _a.sent();
                    return [4 /*yield*/, repository.getSubscriptionById(subscription.id)];
                case 5:
                    renewedSubscription = _a.sent();
                    expect(renewedSubscription.autoRenew).toBe(AutoRenewStatus_1.default.Enabled);
                    expectSubscriptionToBeRenewed(renewedSubscription, subscription.endAt);
                    return [4 /*yield*/, repository.getLastPaymentForSubscription(renewedSubscription.id, PaymentStatus_1.default.Paid, PaymentType_1.default.AutoRenew)];
                case 6:
                    payment = _a.sent();
                    expect(payment).not.toBeNull();
                    expectedMessage = new PaymentMessage_1.default(subscription.id, PaymentType_1.default.AutoRenew);
                    return [4 /*yield*/, expectPaymentMessageToBeEqual(expectedMessage)];
                case 7:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Failed to auto renew subscription with wrong secret', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, paymentDetails, subscription, renewJob, renewedSubscription, payment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, createPaymentDetails(user, (0, crypto_1.randomUUID)())];
                case 2:
                    paymentDetails = _a.sent();
                    return [4 /*yield*/, createSubscription(user, AutoRenewStatus_1.default.Enabled)];
                case 3:
                    subscription = _a.sent();
                    renewJob = inversify_config_1.container.get(types_1.TYPES.RenewJob);
                    // Act
                    return [4 /*yield*/, renewJob.run()
                        // Assert
                    ];
                case 4:
                    // Act
                    _a.sent();
                    return [4 /*yield*/, repository.getSubscriptionById(subscription.id)];
                case 5:
                    renewedSubscription = _a.sent();
                    expect(renewedSubscription.autoRenew).toBe(AutoRenewStatus_1.default.Retry);
                    expect(renewedSubscription.endAt).toStrictEqual(subscription.endAt);
                    return [4 /*yield*/, repository.getLastPaymentForSubscription(renewedSubscription.id, PaymentStatus_1.default.Failed, PaymentType_1.default.AutoRenew)];
                case 6:
                    payment = _a.sent();
                    expect(payment).not.toBeNull();
                    expect(payment.status).toBe(PaymentStatus_1.default.Failed);
                    expect(payment.paidAt).toBeNull();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Double failed to auto renew subscription with wrong secret', function () { return __awaiter(void 0, void 0, void 0, function () {
        var user, paymentDetails, subscription, renewJob, failedPayment, renewedSubscription, payment, expectedMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, createPaymentDetails(user, (0, crypto_1.randomUUID)())];
                case 2:
                    paymentDetails = _a.sent();
                    return [4 /*yield*/, createSubscription(user, AutoRenewStatus_1.default.Enabled)];
                case 3:
                    subscription = _a.sent();
                    renewJob = inversify_config_1.container.get(types_1.TYPES.RenewJob);
                    // Act
                    return [4 /*yield*/, renewJob.run()];
                case 4:
                    // Act
                    _a.sent();
                    return [4 /*yield*/, repository.getLastPaymentForSubscription(subscription.id, PaymentStatus_1.default.Failed, PaymentType_1.default.AutoRenew)];
                case 5:
                    failedPayment = _a.sent();
                    return [4 /*yield*/, updatePaymentCreatedAt(failedPayment, luxon_1.DateTime.utc().minus({ day: 1 }))];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, renewJob.run()
                        // Assert
                    ];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, repository.getSubscriptionById(subscription.id)];
                case 8:
                    renewedSubscription = _a.sent();
                    expect(renewedSubscription.autoRenew).toBe(AutoRenewStatus_1.default.Failed);
                    expect(renewedSubscription.endAt).toStrictEqual(subscription.endAt);
                    return [4 /*yield*/, repository.getLastPaymentForSubscription(renewedSubscription.id, PaymentStatus_1.default.Failed, PaymentType_1.default.AutoRenew)];
                case 9:
                    payment = _a.sent();
                    expect(payment).not.toBeNull();
                    expect(payment.status).toBe(PaymentStatus_1.default.Failed);
                    expect(payment.paidAt).toBeNull();
                    expectedMessage = new FailedSubscriptionAutoRenewMessage_1.default(renewedSubscription.id);
                    return [4 /*yield*/, expectFailedAutoRenewMessageToBeEqual(expectedMessage)];
                case 10:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Verify there are no additional messages']
    afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        var messages, notNullMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        messageBroker.getPaymentMessage(false),
                        messageBroker.getFailedAutoRenewMessage(false)
                    ])];
                case 1:
                    messages = _a.sent();
                    notNullMessage = messages.filter(function (x) { return x != null; });
                    expect(notNullMessage.length).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
});
var createUser = function () { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = new User_1.default(0, (0, crypto_1.randomInt)(1, 1000000), (0, crypto_1.randomUUID)());
                return [4 /*yield*/, repository.createUser(user)];
            case 1:
                _a.sent();
                return [2 /*return*/, user];
        }
    });
}); };
var createPayment = function (user, type, subscription) { return __awaiter(void 0, void 0, void 0, function () {
    var payment;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                payment = new Payment_1.default(0, PLAN.price, user.id, subscription === null || subscription === void 0 ? void 0 : subscription.id, PLAN.id, type);
                return [4 /*yield*/, repository.createPayment(payment)];
            case 1:
                _a.sent();
                return [2 /*return*/, payment];
        }
    });
}); };
var createPaymentDetails = function (user, secret) { return __awaiter(void 0, void 0, void 0, function () {
    var pool, paymentDetails;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pool = inversify_config_1.container.get(types_1.TYPES.DatabasePool);
                return [4 /*yield*/, pool.query('DELETE FROM payment_details WHERE secret=$1', [PAYMENT_SECRET])];
            case 1:
                _a.sent();
                paymentDetails = new PaymentDetails_1.default(0, user.id, PAYMENT_METHOD, 'yoo_money', secret);
                return [4 /*yield*/, repository.createPaymentDetails(paymentDetails)];
            case 2:
                _a.sent();
                return [2 /*return*/, paymentDetails];
        }
    });
}); };
var getUserSubscription = function (user) { return __awaiter(void 0, void 0, void 0, function () {
    var pool, result, id;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pool = inversify_config_1.container.get(types_1.TYPES.DatabasePool);
                return [4 /*yield*/, pool.query('SELECT id FROM subscriptions WHERE user_id=$1 LIMIT 1', [user.id])];
            case 1:
                result = _a.sent();
                id = result.rows[0].id;
                return [2 /*return*/, repository.getSubscriptionById(id)];
        }
    });
}); };
var createSubscription = function (user, autoRenewStatus) {
    if (autoRenewStatus === void 0) { autoRenewStatus = AutoRenewStatus_1.default.Disabled; }
    return __awaiter(void 0, void 0, void 0, function () {
        var subscription;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    subscription = new Subscription_1.default(0, user.id, PLAN.id, luxon_1.DateTime.utc(), luxon_1.DateTime.utc(), false, (0, RandomHex_1.default)(), autoRenewStatus);
                    return [4 /*yield*/, repository.createSubscription(subscription)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, subscription];
            }
        });
    });
};
var updatePaymentCreatedAt = function (payment, date) { return __awaiter(void 0, void 0, void 0, function () {
    var pool, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pool = inversify_config_1.container.get(types_1.TYPES.DatabasePool);
                return [4 /*yield*/, pool.query('UPDATE payments SET created_at=$1 WHERE id=$2', [date, payment.id])];
            case 1:
                result = _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var createPaymentParameters = function (payment, secret) { return ({
    uuid: (0, crypto_1.randomUUID)(),
    paymentId: payment.id,
    amount: PLAN.price,
    currency: 'RUB',
    paymentDetails: {
        billingProvider: PAYMENT_METHOD,
        paymentMethod: 'card',
        secret: secret,
        isSaved: !!secret
    }
}); };
var expectSubscriptionToBeRenewed = function (subscription, previousEndAt) {
    var plan = (0, GetPlanById_1.default)(subscription.planId);
    var expectedEndAt = previousEndAt.plus(luxon_1.Duration.fromISO(plan.duration)).plus({ day: RENEWAL_BONUS_DAYS });
    var dif = Math.abs(subscription.endAt.diff(expectedEndAt, 'hours').hours);
    expect(dif < 1).toBeTruthy();
};
var expectPaymentMessageToBeEqual = function (expectedMessage) { return __awaiter(void 0, void 0, void 0, function () {
    var message;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, messageBroker.getPaymentMessage(true)];
            case 1:
                message = _a.sent();
                expect(message).not.toBeNull();
                expect(expectedMessage.equals(message)).toBeTruthy();
                return [2 /*return*/];
        }
    });
}); };
var expectFailedAutoRenewMessageToBeEqual = function (expectedMessage) { return __awaiter(void 0, void 0, void 0, function () {
    var message;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, messageBroker.getFailedAutoRenewMessage(true)];
            case 1:
                message = _a.sent();
                expect(message).not.toBeNull();
                expect(expectedMessage.equals(message)).toBeTruthy();
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=payment.test.js.map