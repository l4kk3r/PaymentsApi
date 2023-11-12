/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addConstraint('users', 'users_telegram_id_key', {
        unique: 'telegram_id'
    })

    pgm.addConstraint('payments', 'payments_user_id_fkey', {
        foreignKeys: {
            columns: 'user_id',
            references: 'users (id)'
        }
    })

    pgm.alterColumn('payments', 'status', {
        notNull: true
    })

    pgm.addConstraint('subscriptions', 'subscriptions_user_id_fkey', {
        foreignKeys: {
            columns: 'user_id',
            references: 'users (id)'
        }
    })

    pgm.alterColumn('subscriptions', 'plan_id',  {
        notNull: true
    })

    pgm.alterColumn('subscriptions', 'config_id', {
        notNull: true
    })

    pgm.addConstraint('subscriptions', 'subscriptions_config_id_fkey', {
        foreignKeys: {
            columns: 'config_id',
            references: 'configs (id)'
        }
    })

    pgm.alterColumn('configs', 'available',  {
        notNull: true
    })
};

exports.down = pgm => {
    pgm.dropConstraint('users', 'users_telegram_id_key')

    pgm.dropConstraint('payments', 'payments_user_id_fkey')

    pgm.alterColumn('payments', 'status', {
        notNull: false
    })

    pgm.dropConstraint('subscriptions', 'subscriptions_user_id_fkey')

    pgm.alterColumn('subscriptions', 'plan_id',  {
        notNull: false
    })

    pgm.alterColumn('subscriptions', 'config_id', {
        notNull: false
    })

    pgm.dropConstraint('subscriptions', 'subscriptions_config_id_fkey')

    pgm.alterColumn('configs', 'available',  {
        notNull: true
    })
};
