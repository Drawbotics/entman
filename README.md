<img src="https://raw.githubusercontent.com/Drawbotics/entman/79b74b1ebdfba5250a273fe9da7a3839d8c81f4e/entman-logo.png" width="50%">


# Entman

A library to help you manage your entities in a [redux](https://github.com/reactjs/redux)
store when using [normalizr](https://github.com/paularmstrong/normalizr). **Entman** takes care of
retrieving them from the store and creating, deleting
and updating the entities while keeping the relations between them in sync.

The idea is that everything that has a model in the *backend* should be an
entity in the *frontend*. The management of entities is usually something very
straightforward but tedious, so you leave this work to **entman** and
you can focus on the rest.

[![npm version](https://img.shields.io/npm/v/entman.svg?style=flat-square)](https://www.npmjs.com/package/entman)
[![build status](https://img.shields.io/travis/Drawbotics/entman/master.svg?style=flat-square)](https://travis-ci.org/Drawbotics/entman) 

## Install

Install it as a node module as usual with [npm](https://www.npmjs.org/) along its peer dependencies:

```bash
$ npm install -S entman redux normalizr
```

Or using [yarn](https://yarnpkg.com/):

```bash
$ yarn add entman redux normalizr
```


## Example

A quick example to see **entman** in action:

### schemas.js

We use schemas to define relationships between our entities. We can also define
methods that will be available in the entity and serve like some sort of computed property.

```javascript
import { defineSchema, hasMany, generateSchemas } from 'entman';

const Group = defineSchema('Group', {
  attributes: {
    users: hasMany('User'),  // Use the name of another model to define relationships

    getNumberOfUsers() {  // Define methods that interact with the entity instance
      return this.users.length;
    }
  }
});

const User = defineSchema('User', {
  attributes: {
    group: 'Group',
  }
});

// Generate and export the schemas. Schemas will be exported as an object
// with the name of every schema as the keys and the actual schemas as values.
export default generateSchemas([
  Group,
  User,
])
```


### reducer.js

Connect the entities reducer to the state.

```javascript
import { combineReducers } from 'redux';
import { reducer as entities } from 'entman';
import schemas from './schemas';

export default combineReducers({
  // Other reducers,
  entities: entities(schemas),
})
```


### store.js

Connect the entman middleware to the store.

```javascript
import { createStore, applyMiddleware } from 'redux';
import { middleware as entman } from 'entman';
import reducer from './reducer';

export default createStore(
  store,
  applyMiddleware(entman({ enableBatching: true })),
);
```


### selectors.js

Create selectors that will retrieve the entities from the store. Selectors also
take care of populating relationships and adding the *getter* methods defined in the
schema. It's recommended to wrap **entman** selectors intead of using them directly
so they're abstracted from the rest of the system.

```javascript
import { getEntity } from 'entman';
import schemas from './schemas';

export function getGroup(state, id) {
  return getEntity(state, schemas.Group, id);
}
```


### actions.js

Create some actions using the helpers from **entman**. The helpers will take an action and
wrap it with entman functionality. This way, you can still react in your reducers to your
own actions and the entity management is just a side effect that entman will take care of.

```javascript
import {
  createEntities,
} from 'entman';
import schemas from './schemas';

export const CREATE_USER = 'CREATE_USER';

export function createUser(user) {
  return createEntities(schemas.User, 'payload.user', {
    type: CREATE_USER,  // CREATE_USER action will be dispatched alongside entman actions
    payload: { user },
  });
}
```


### Group.jsx

Finally, use your actions and selectors like you would normally do.

```jsx
import React from 'react';
import { connect } from 'react-redux';
import { getGroup } from './selectors';
import { loadGroup, createUser } from './actions';

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
    const { group, createUser } = this.props;
    const { name } = this.state;
    const user = { name, group: group.id };
    createUser(user);
  }
}

const mapStateToProps = (state, ownProps) => ({
  group: getGroup(state, ownProps.params.groupId),
});

const mapDispatchToProps = {
  loadGroup,
  createUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(Group);
```


## API

TODO


## LICENSE

MIT. See [LICENSE](LICENSE) for details.
