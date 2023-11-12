/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('users', {
        ref_id: { type: 'int', references: 'users (id)' }
    })

    pgm.addColumns('subscriptions', {
        last_ref_claim: { type: 'timestamp' }
    })
};

exports.down = pgm => {};
