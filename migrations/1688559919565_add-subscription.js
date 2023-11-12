/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('subscriptions', {
        id: { type: 'serial', primaryKey: true },
        user_id: { type: 'int', notNull: true },
        plan_id: { type: 'varchar(128)' },
        start_at: { type: 'timestamp', notNull: true },
        end_at: { type: 'timestamp', notNull: true },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        }
    })
};

exports.down = pgm => {
    pgm.dropTable('subscriptions')
};
