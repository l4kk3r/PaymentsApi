/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.dropColumns('subscriptions', ['created_at', 'last_ref_claim']);
    pgm.alterColumn('configs', 'created_at', { default: pgm.func('current_timestamp at time zone \'utc\'') })
    pgm.alterColumn('payments', 'created_at', { default: pgm.func('current_timestamp at time zone \'utc\'')})
    pgm.alterColumn('users', 'created_at', { default: pgm.func('current_timestamp at time zone \'utc\'')})
};

exports.down = pgm => {
    pgm.addColumn('subscriptions', {
        created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp at time zone \'utc\'') },
        last_ref_claim: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp at time zone \'utc\'') }
    });
};
