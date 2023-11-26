/* eslint-disable camelcase */

exports.shorthands = undefined;

const defaultPlans = [
    {
        "name": "1 день",
        "id": "ok_vpn_1_day",
        "price": 1,
        "duration": "P1D",
        "show": false
    },
    {
        "name": "1 месяц",
        "id": "ok_vpn_1_month",
        "price": 179,
        "duration": "P30D",
        "show": true
    },
    {
        "name": "3 месяца",
        "id": "ok_vpn_3_month",
        "price": 479,
        "duration": "P90D",
        "show": true
    },
    {
        "name": "12 месяцев",
        "id": "ok_vpn_12_month",
        "price": 1599,
        "duration": "P365D",
        "show": true
    }
]

exports.up = pgm => {
    pgm.createTable('plans', {
        id: { type: 'text', primaryKey: true },
        name: { type: 'text', notNull: true },
        price: { type: 'double', notNull: true },
        duration: { type: 'text', notNull: true },
        show: { type: 'boolean', notNull: true }
    })

    for (let plan of defaultPlans) {
        pgm.sql(
            `INSERT INTO plans (id, name, price, duration, show) VALUES ('${plan.id}', '${plan.name}', ${plan.price}, '${plan.duration}', ${plan.show});`,)
    }

    pgm.addConstraint('payments', 'payments_plan_id_fk', {
        foreignKeys: {
            columns: 'plan_id',
            references: 'plans (id)'
        }
    })

    pgm.addConstraint('subscriptions', 'subscriptions_plan_id_fk', {
        foreignKeys: {
            columns: 'plan_id',
            references: 'plans (id)'
        }
    })
};

exports.down = pgm => {
    pgm.dropConstraint('payments', 'payments_plan_id_fk')
    pgm.dropConstraint('subscriptions', 'subscriptions_plan_id_fk')
    pgm.dropTable('plans')
};
