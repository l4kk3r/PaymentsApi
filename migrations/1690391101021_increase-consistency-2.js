/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addConstraint('subscriptions', 'subscriptions_config_id_key', {
        unique: 'config_id'
    })
};

exports.down = pgm => {
    pgm.dropConstraint('subscriptions_config_id_key')
};
