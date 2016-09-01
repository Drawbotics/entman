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

### store.js

Connect the middleware to your store.

```javascript
import { createStore, applyMiddleware, compose } from 'redux';
import { entitiesMiddleware } from '_InsertName_';
import reducer from './reducer';

export default createStore(
  reducer,
  compose(
    applyMiddleware(
      // Other middlewares,
      entitiesMiddleware,
    ),
  ),
);
```

### selectors.js

Create selectors for the entities. This way the entities access code is abstracted
from the rest of the system.

```javascript
import { getEntity } from '_InsertName_';
import schemas from './schemas';

export function getGroup(state, id) {
  return getEntity(state, schemas.Group, id);
}
```

### actions.js

```javascript
import {
  loadEntity,
  createEntity,
  saveEntity,
  createAndSaveEntity,
} from '_InsertName_';
import schemas from './schemas';

export const LOAD_GROUP = 'LOAD_GROUP';

export function loadGroup(id) {
  /**
   * loadEntity() will generate automatically
   * LOAD_${ENTITY}_SUCCESS and LOAD_${ENTITY}_FAIL
   * to report about the result of the operation.
   */
  return loadEntity(schemas.Group, id);  // 'GET /groups/id'
}

export const CREATE_USER = 'CREATE_USER';

export function createUser(user) {
  return createEntity(schemas.User, user);  // Add user to the store
}

export const SAVE_USER = 'SAVE_USER';

export function saveUser(id) {
  return saveEntity(schemas.User, id);  // 'POST /users'
}

export const CREATE_AND_SAVE_USER = 'CREATE_AND_SAVE_USER';

export function createAndSaveUser(user) {
  return createAndSaveEntity(schemas.User, user);
}
```

### Component.jsx

```jsx
import React from 'react';
import { connect } from 'react-redux';
import { getGroup } from './selectors';
import { loadGroup } from './actions';

class Group extends React.Component {
  constructor(props) {
    super(props);
    this._handleInput = this._handleInput.bind(this);
    this._handleAddUser = this._handleAddUser.bind(this);
  }

  componentDidMount() {
    const { loadGroup, params } = this.props;
    loadGroup(params.groupId);
  }

  render() {
    const { group } = this.props;
    return (
      <div>
        <h1>{group.name}</h1>
        <h2>{group.getNumberOfUsers()} members</h2>
        <ul>
          {group.users.map(u => (
            <li>{u.name}</li>
          ))}
        </ul>
        {this.state.showForm &this.setState({ showForm: true });&
          this._renderUserForm()
        }
        { ! this.state.showForm &&
          <button type="button" onClick={() => this.setState({ showForm: true })}>
            Add
          </button>
        }
      </div>
    );
  }

  _renderUserForm() {
    return (
      <div>
        <input type="text" onChange={this._handleInput} />
        <button type="button" onClick={() => this.setState({ showForm: false })}>
          Cancel
        </button>
        <button type="button" onClick={this._handleAddUser}>Save</button>
      </div>
    );
  }

  _handleInput(e) {
    this.setState({ name: e.target.value });
  }

  _handleAddUser(e) {
    const { group, createAndSaveUser } = this.props;
    const { name } = this.state;
    const user = { group, name };
    createAndSaveUser(user);
  }
}

const mapStateToProps = (state, ownProps) => ({
  group: getGroup(state, ownProps.params.groupId),
});

const mapDispatchToProps = {
  loadGroup,
  createAndSaveUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(Group);
```

More examples in the [examples]() folder.


## Documentation

 - [Introduction]()
 - [Getting Started]()
 - [Accessing Data]()
 - [Modifying Data]()
 - [Communication With The Server]()
 - [API]()
