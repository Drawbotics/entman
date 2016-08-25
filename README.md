# Entities Manager


A library to help you manage your entities in a [redux](http://www.github.com/)
store. **_InsertName_** manages everything for you. From the communication with
the server to the access to the data in the store.

The idea is that everything that has a model in the *backend* should be an
entity in the *frontend*. The management of entities is something very
straightforward but tedious, so you leave this work to **_InsertName_** and
you focus on the rest.


## Install

Install it as a node module as usual with [npm]():

```bash
$ npm install -S _InsertName_
```

Alternatively, you can link directly the build provided in a `<script>` tag.


## Example

A quick example to see **_InsertName_** in action:

### schemas.js

We use schemas to define relationships between our entities.

```javascript
import { defineSchema, hasMany, generateSchemas } from '_InsertName_';

const Group = defineSchema('Group', {
  users: hasMany('User'),  // Use the name of another model to define relationships

  getNumberOfUsers() {  // Define methods that interact with the entity instance
    return this.users.length;
  }
});

const User = defineSchema('User', {
  group: 'Group',
});

// Generate and export the schemas. Schemas will be exported as an object
// with the name of the schema as the key.
export default generateSchemas([
  Group,
  User,
])
```

### reducer.js

Connect the entities reducer to the state.

```javascript
import { combineReducers } from 'redux';
import schemas from './schemas';

export default combineReducers({
  // Other reducers,
  entities: entities(schemas),
})
```

### selectors.js

Create selectors for the entities. This way the entities access code is abstracted
from the rest of the system.

```javascript
import { getEntity } from '_InsetName_';

export function getGroup(state, id) {
  return getEntity(state, 'Group', id);
}
```

### Component.jsx

```jsx
import { connect } from 'react-redux';
import { getGroup } from './selectors';

const Group = ({
  group,
}) => (
  <div>
    <h1>{group.name}</h1>
    <h2>{group.getNumberOfUsers()} members</h2>
    <ul>
      {group.users.map(u => (
        <li>{u.name}</li>
      ))}
    </ul>
  </div>
);

const mapStateToProps = (state, ownProps) => ({
  group: getGroup(state, ownProps.params.groupId),
});

export default connect(mapStateToProps)(Group);
```

More examples in the [examples]() folder.


## Documentation

 - [Introduction]()
 - [Getting Started]()
 - [Accessing Data]()
 - [Modifying Data]()
 - [Communication With The Server]()
 - [API]()
