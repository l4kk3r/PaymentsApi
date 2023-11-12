/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('configs', {
        subscription_id: { type: 'int', references: 'subscriptions (id)' }
    })
    pgm.alterColumn('subscriptions', 'config_id', {
        notNull: false
    })
};

exports.down = pgm => {
    pgm.dropColumns('configs', 'subscription_id')
    pgm.alterColumn('subscriptions', 'config_id', {
        notNull: true
    })
};
