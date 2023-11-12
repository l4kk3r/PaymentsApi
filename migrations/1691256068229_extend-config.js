/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('configs', {
        server: { type: 'text' },
        public_key: { type: 'text' }
    })

    pgm.dropColumns('configs', ['available'])
};

exports.down = pgm => {
    pgm.dropColumns('configs', ['server', 'public_key'])

    pgm.addColumns('configs', {
        available: { type: 'boolean', default: true }
    })
};
