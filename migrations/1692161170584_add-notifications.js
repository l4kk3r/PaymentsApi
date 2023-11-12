/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.dropTable('renewal_notifications')

    pgm.createTable('notifications', {
        id: { type: 'serial', primaryKey: true },
        type: { type: 'text', notNull: true },
        data: { type: 'jsonb' }
    })
};

exports.down = pgm => {
    pgm.createTable('renewal_notifications', {
        id: { type: 'serial', primaryKey: true },
        subscription_id: { type: 'int', references: 'subscriptions (id)', unique: true },
        last_notification_id: { type: 'text' }
    })

    pgm.dropTable('notifications');
};
