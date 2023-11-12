/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    pgm.addColumns('subscriptions', {
        'identifier': { type: 'text', unique: true, notNull: true, default: pgm.func('uuid_generate_v4()') }
    })
};

exports.down = pgm => {
    pgm.dropColumns('subscriptions', 'identifier')
};
