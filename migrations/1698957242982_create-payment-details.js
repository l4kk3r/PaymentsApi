/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('payment_details', {
        id: { type: 'serial', primaryKey: true },
        user_id: { type: 'int', references: 'users (id)', notNull: true },
        billing_provider: { type: 'string', notNull: true },
        payment_method: { type: 'text', notNull: true },
        secret: { type: 'text', notNull: true, unique: true }
    })
};

exports.down = pgm => {
    pgm.dropTable('payment_details')
};
