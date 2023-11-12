/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('notifications', {
        sent_at: { type: 'timestamp', notNull: true, default: pgm.func('(current_timestamp at time zone \'utc\')') }
    })
};

exports.down = pgm => {
    pgm.dropColumns('notifications','sent_at');
};
