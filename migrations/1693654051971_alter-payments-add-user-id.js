/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('payments', {
        user_id: { type: 'int', references: 'users (id)' }
    })
};

exports.down = pgm => {
    pgm.dropColumns('payments', ['user_id']);
};
