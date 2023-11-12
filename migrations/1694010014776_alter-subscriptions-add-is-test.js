/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('subscriptions', {
        is_test: { type: 'boolean', notNull: true, default: false }
    })
};

exports.down = pgm => {
    pgm.dropColumns('subscriptions', ['is_test']);
};
