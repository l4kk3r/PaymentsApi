/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('configs', {
        key_id: { type: 'text' }
    })
};

exports.down = pgm => {
    pgm.dropColumns('configs', 'key_id')
};
