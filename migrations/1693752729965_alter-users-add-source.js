/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('users', {
        source: { type: 'text' }
    })
};

exports.down = pgm => {
    pgm.dropColumns('users',['source']);
};
