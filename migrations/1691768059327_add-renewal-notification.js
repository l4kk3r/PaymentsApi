/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('renewal_notifications', {
        id: { type: 'serial', primaryKey: true },
        subscription_id: { type: 'int', references: 'subscriptions (id)', unique: true },
        last_notification_id: { type: 'text' }
    })
};

exports.down = pgm => {
    pgm.dropTable('renewal_notifications');
};
