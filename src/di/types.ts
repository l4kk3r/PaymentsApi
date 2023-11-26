const TYPES = {
    DatabasePool: Symbol.for('DatabasePool'),
    YookassaService: Symbol.for("YookassaService"),
    PaymentService: Symbol.for("PaymentService"),
    SubscriptionService: Symbol.for("SubscriptionService"),
    MessageBroker: Symbol.for("MessageBroker"),
    ServerService: Symbol.for("ServerService"),
    ConfigService: Symbol.for("ConfigService"),
    Repository: Symbol.for("Repository"),
    CachedRepository: Symbol.for("CachedRepository"),
    EmailService: Symbol.for("EmailService"),
    CrmService: Symbol.for('CrmService'),
    EncryptionService: Symbol.for('EncryptionService'),
    RenewJob: Symbol.for("RenewJob"),
    LoggerFactory: Symbol.for('LoggerFactory')
}

export { TYPES };