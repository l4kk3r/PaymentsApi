/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addConstraint('users', 'users_email_key', 'unique (email)')
};

exports.down = pgm => {
    pgm.dropConstraint('users', 'users_email_key')
};
