/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('users', {
        id: { type: 'serial', primaryKey: true },
        telegram_id: { type: 'bigint', notNull: true },
        username: { type: 'varchar(128)' },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        }
    })
}

exports.down = pgm => {
    pgm.dropTable('users')
}
