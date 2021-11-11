import React, {Component} from 'react';
import {View, StatusBar} from 'react-native';
import ReduxNavigation from '../Navigation/ReduxNavigation';
import {connect} from 'react-redux';
import StartupActions from '../Redux/StartupRedux';
import ReduxPersist from '../Config/ReduxPersist';
import Utils from '../Utils/Utils';

// Styles
import styles from './Styles/RootContainerStyles';

class RootContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
    };
  }

  async componentDidMount() {
    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');
    console.log(username, 'consling username here>>>>>>>>>>>>>>1111');
    this.setState({
      username: username,
    });
    // if redux persist is not active fire startup action
    if (!ReduxPersist.active) {
      this.props.startup();
    }
  }

  render() {
    return (
      <View style={styles.applicationView}>
        <StatusBar barStyle="light-content" />
        <ReduxNavigation username={this.state.username} />
      </View>
    );
  }
}

// wraps dispatch to create nicer functions to call within our component
const mapDispatchToProps = dispatch => ({
  startup: () => dispatch(StartupActions.startup()),
});

export default connect(null, mapDispatchToProps)(RootContainer);
