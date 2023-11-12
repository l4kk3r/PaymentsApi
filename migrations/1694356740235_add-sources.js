/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('sources', {
        id: { type: 'serial', primaryKey: true },
        name: { type: 'text', notNull: true },
        tag: { type: 'text', unique: true, notNull: true },
        created_at: { type: 'timestamp', notNull: true, default: pgm.func('(current_timestamp at time zone \'utc\')') }
    })
};

exports.down = pgm => {
    pgm.dropTable('sources');
};
