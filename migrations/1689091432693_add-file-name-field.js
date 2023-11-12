/* eslint-disable camelcase */

const {PgLiteral} = require("node-pg-migrate");
exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('configs', {
        file_name: { type: 'text', unique: true, notNull: true, default: new PgLiteral('md5(random()::text)') }
    })
};

exports.down = pgm => {
    pgm.dropColumns('configs', ['file_name'])
};
