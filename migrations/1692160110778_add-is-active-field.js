/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('configs', {
        is_active: { type: 'bool', notNull: true, default: true }
    })
};

exports.down = pgm => {
    pgm.dropColumns('configs', ['is_active']);
};
