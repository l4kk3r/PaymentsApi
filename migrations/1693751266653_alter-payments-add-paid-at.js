/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('payments', {
        paid_at: { type: 'timestamp' },
    })
};

exports.down = pgm => {
    pgm.dropColumns('payments', ['paid_at']);
};
