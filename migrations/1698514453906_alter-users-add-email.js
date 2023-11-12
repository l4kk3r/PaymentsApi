/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('users', {
        email: { type: 'text' }
    })

    pgm.alterColumn('users', 'telegram_id', {
        notNull: false
    })
};

exports.down = pgm => {
    pgm.dropColumn('users', 'telegram')

    pgm.alterColumn('users', 'telegram_id', {
        notNull: true
    })
};
