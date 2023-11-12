/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('payments', {
        telegram_notification_id: { type: 'bigint' }
    })
};

exports.down = pgm => {
    pgm.dropColumns('paments', ['telegram_notification_id'])
};
