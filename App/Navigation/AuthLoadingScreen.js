import React from 'react';
import {ActivityIndicator, StatusBar, View} from 'react-native';
import Utils from '../Utils/Utils';

export default class AuthLoadingScreen extends React.Component {
  componentDidMount() {
    this._bootstrapAsync();
  }

  // Fetch the  storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');
    console.log(username, 'consling username here>>>>>>>>>>>>>>1111');
    console.log(this.props, 'this.propsthis.propsthis.propsthis.props111');
    console.log(username, 'lengthlength');
    this.props.navigation.navigate(username == undefined ? 'Auth' : 'App');
  };

  // Render any loading content that you like here
  render() {
    return (
      <View
        style={{
          flex: 1,
        }}>
        <StatusBar barStyle="default" />

        <ActivityIndicator
          style={{
            alignSelf: 'center',
          }}
        />
      </View>
    );
  }
}
