import React from 'react';
import { connect } from 'react-redux';

import {
  loadGroups,
  checkTask,
  uncheckTask,
} from '../actions';
import {
  getGroups,
  checkIfLoadingGroups,
} from '../selectors';


class Groups extends React.Component {
  componentDidMount() {
    const { loadGroups } = this.props;
    loadGroups();
  }

  render() {
    const {
      groups,
      isLoading,
      checkTask,
      uncheckTask,
    } = this.props;
    return (
      <div>
        <h1>Groups</h1>
        {isLoading && <h2>Loading...</h2>}
        {! isLoading && groups.map((group, i) => (
          <div key={i}>
            <h3>{group.name}</h3>
            <ul>
              {group.users.map((user, i) => (
                <li key={i}>
                  <h4>{user.name}</h4>
                  <ol>
                    {user.tasks.map((task, i) => (
                      <li key={i}>
                        <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>{task.title}</span>
                        <button type="button" onClick={() => task.done ? uncheckTask(task) : checkTask(task)}>
                          {task.done ? 'Uncheck' : 'Check'}
                        </button>
                        <button>Delete</button>
                      </li>
                    ))}
                  </ol>
                  <button>Add task</button>
                </li>
              ))}
            </ul>
            <button>Add user</button>
          </div>
        ))}
      </div>
    );
  }
}


const mapStateToProps = (state) => ({
  groups: getGroups(state),
  isLoading: checkIfLoadingGroups(state),
});


const mapDispatchToProps = {
  loadGroups,
  checkTask,
  uncheckTask,
};


export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Groups);
