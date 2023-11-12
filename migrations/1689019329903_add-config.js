/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('configs', {
        id: { type: 'serial', primaryKey: true },
        data: { type: 'text', notNull: true },
        available: { type: 'boolean', default: true },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        }
    })

    pgm.addColumns('subscriptions', {
        config_id: { type: 'int' }
    })
};

exports.down = pgm => {
    pgm.dropTable('configs')
    pgm.dropColumns('subscriptions', ['config_id'])
};
