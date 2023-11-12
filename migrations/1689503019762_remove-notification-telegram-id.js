/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.dropColumns('payments', ['telegram_notification_id'])
};

exports.down = pgm => {
    pgm.addColumns('payments', {
        telegram_notification_id: { type: 'bigint' }
    })
};
