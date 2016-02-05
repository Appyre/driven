# Driven ORM

The Driven ORM is a powerful data-layer built overtop of `Knex`.

- relationships (belongsTo, hasMany, manyToMany)
- permissions (owner, individual, group, public | can-view, can-edit, can-admin)
- schema
- migrations
- activity streams
- archiving
- deletions

```
import ORM from 'driven/orm/index';

const {
    types:t,
    primitives:p,
    relationships:r
    } = ORM;

const User = ORM.Model.compose({

    table: ORM.Table.compose({
        name: 'users'
    }),

    attributes: ORM.Schema.compose(
        p.Permissions,
        p.Timestamps,
        p.Defaults,
        {
            first_name: t.string(35),
            last_name:  t.string(35),
            username:   t.string(20),
            email:      t.string(255),
            photo:      r.belongsTo() // r.belongsTo('photo', t.integer())
        })

});

export default User;

let's say Jane wants to follow Tom's timeline.
When Tom adds an event, we look up subscribers and ?
When Tom adds an event, we create a new record for Jane ?

```
-> permission
    -> visibility public|private
    -> groups
    -> individuals

-> user
    -> hasMany set
    -> hasMany entry
    -> hasMany photo
    -> hasOne photo
    -> hasOne contact_info
        -> hasOne address
        -> hasMany address
    -> hasMany friend
    -> hasMany friend_groups

-> set
  -> hasMany users
  -> hasMany set
  -> hasMany entry
  -> hasOne category
