/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('subscriptions', {
        auto_renew: { type: 'text', notNull: true, default: 'disabled' }
    })

    pgm.addColumns('payment_details', {
        created_at: { type: 'timestamp', notNull: true, default: pgm.func('(current_timestamp at time zone \'utc\')') }
    })
};

exports.down = pgm => {
    pgm.dropColumns('subscriptions', 'auto_renew')

    pgm.dropColumns('payment_details', 'created_at')
};
