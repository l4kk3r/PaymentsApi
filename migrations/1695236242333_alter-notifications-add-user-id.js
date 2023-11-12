/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('notifications', {
        user_id: { type: 'int', references: 'users (id)' }
    })
};

exports.down = pgm => {
    pgm.dropColumns('notifications', ['user_id'])
};
