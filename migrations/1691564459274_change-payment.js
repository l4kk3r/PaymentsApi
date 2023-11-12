/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.dropColumns('payments', ['user_id', 'product_id'])

    pgm.addColumns('payments', {
        entity_id: { type: 'int' },
        type: { type: 'string' }
    })
};

exports.down = pgm => {
    pgm.dropColumns('payments', ['entity_id', 'type'])
    pgm.addColumns('payments', {
        user_id: { type: 'int' },
        product_id: { type: 'int' }
    })
};
