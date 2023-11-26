/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createIndex('users', 'ref_id')
    pgm.createIndex('users', 'username')
    pgm.createIndex('subscriptions', 'end_at')
    pgm.createIndex('configs', 'subscription_id')
    pgm.createIndex('subscriptions', 'user_id')
    pgm.createIndex('payments', 'entity_id')
    pgm.createIndex('payment_details', 'user_id')
    pgm.createIndex('notifications', '(data->\'subscription_id\')')
};

exports.down = pgm => {
    pgm.createIndex('users', 'ref_id')
    pgm.dropIndex('users', 'username')
    pgm.dropIndex('subscriptions', 'end_at')
    pgm.dropIndex('configs', 'subscription_id')
    pgm.dropIndex('subscriptions', 'user_id')
    pgm.dropIndex('payments', 'entity_id')
    pgm.dropIndex('payment_details', 'user_id')
    pgm.dropIndex('notifications', '(data->\'subscription_id\')')
};
