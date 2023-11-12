/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('payments', {
        id: { type: 'serial', primaryKey: true },
        amount: { type: 'integer', notNull: true },
        user_id: { type: 'bigint', notNull: true },
        product_id: { type: 'varchar(128)', notNull: true },
        plan_id: { type: 'varchar(128)', notNull: true },
        status: { type: 'varchar(128)', default: 'created' },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    })
}

exports.down = pgm => {
    pgm.dropTable('payments')
}
