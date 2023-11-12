/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.dropColumns('configs', ['public_key', 'file_name'])
};

exports.down = pgm => {
    pgm.addColumns('configs', {
        public_key: { type: 'text', notNull: true },
        file_name: { type: 'text', notNull: true }
    })
};
