import React, {Component, Dimensions} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import {connect} from 'react-redux';
import CheckBox from 'react-native-modest-checkbox';
import {Images} from '../Themes';
import Drawer from '././Drawer';
import Utils from '../Utils/Utils';
import {Base64} from 'js-base64';
import DBPCStaticDataHelper from '../DB/DBPCStaticDataHelper';
import Config from 'react-native-config';
import apisauce from 'apisauce';

// Styles
import styles from './Styles/LoginStyle';

// For API
import API from '../../App/Services/Api';
import FJSON from 'format-json';
// import { AsyncStorage } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

class Login extends Component {
  api = {};

  constructor(props) {
    super(props);
    this.api = API.create();
    //apisauce = newApi;

    this.state = {
      // username: "RVTechnologies.User1",
      // password: "D3v3l0PmenT1",
      // environment: "PDEV1",

      // username: "PROC_EMP",
      // password: "Skanska123",
      // environment: "PDEV1",

      // username: "PROC_EMP",
      // password: "Skanska123",
      // environment: "SKAD3",

      // username: 'Products.User',
      // password: 'Welcome41',
      // environment: 'PDEV1',

      username: "",
      password: "",
      environment: "",

      envURL: '',
      isLoading: false,
      isChecked: false,
    };

    // this.checkRememberMe();
  }

  // componentDidMount() {
  //   this.checkTimeOut();
  // }

  async getEnvironment() {
    if (!this.state.environment) {
      Alert.alert('', 'Please enter an environment.', [{text: 'OK'}], {
        cancelable: false,
      });
    } else {
      this.setState({isLoading: false});
      const envparam = [this.state.environment];
      module.exports = envparam;

      Utils.storeDataToAsyncStorage('ENVIRONMENT', this.state.environment);
      console.log('Environment Variable ', envparam);
      const environment = await Utils.retrieveDataFromAsyncStorage(
        'ENVIRONMENT',
      );
      console.log('Environment Variable (API) ', environment);
      //console.log("Original baseURL", API.create(baseURL));
      let envURL = '';
      if (environment == 'SKAD3') {
        console.log('INTO IF');
        envURL =
          'https://skad3a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
        console.log(this.api, 'LETS GOOOO');
      } else if (environment == 'SKAD2') {
        envURL =
          'https://skad2a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
      } else if (environment == 'SKAD1') {
        envURL =
          'https://skad1a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
      } else if (environment == 'SKAT1') {
        envURL =
          'https://skat1a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
      } else if (environment == 'PTEST2') {
        envURL = 'https://ptest2a1-inoapps4.inoapps.com/ords/inoapps_ec/';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
      } else if (environment == 'PDEV1') {
        envURL = 'https://pdev1a1-inoapps4.inoapps.com/ords/inoapps_ec/';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
      } else if (environment == 'PDEV2') {
        envURL = 'https://pdev2a1-inoapps4.inoapps.com/ords/inoapps_ec/';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
      } else if (environment == 'PTEST1') {
        envURL = 'https://ptest1a1-inoapps4.inoapps.com/ords/inoapps_ec/';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
      } else if (environment == 'PDEV3') {
        envURL = 'https://pdev3a1-inoapps4.inoapps.com/ords/inoapps_ec/';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
      } else if (environment == 'PTEST3') {
        envURL = 'https://ptest3a1-inoapps4.inoapps.com/ords/inoapps_ec/';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
      } else if (environment == 'PDEMO') {
        envURL = 'https://pdemo1a1-inoapps4.inoapps.com/ords/inoapps_ec/';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
      } else if (environment == 'SKAD4') {
        envURL =
          'https://skad4a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
      } else if (environment == 'SKAD5') {
        envURL =
          'https://skad5a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
      } else if (environment == 'SKAP') {
        envURL =
          'https://skap1a1-skanskapaas.inoappsproducts.com/ords/inoapps_ec/';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
      } else if (environment == 'GTDEV1') {
        envURL =
          'https://gtdev1a1-gallifordtrypaas.inoappsproducts.com/ords/inoapps_ec/';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
      } else {
        envURL = 'https://www.google.com';
        console.log('New ENV URL ', envURL);
        this.api = new API.create(envURL);
      }
      this.setState({
        isLoading: false,
      });

      this.getLogin(envURL);
    }
  }

  checkTimeOut = async () => {
    var currentDate = new Date();
    const username = await Utils.retrieveDataFromAsyncStorage('user_name');

    if (username == undefined || username == null || username == ' ') {
    } else {
      //const expirationTime = await Utils.retrieveDataFromAsyncStorage("expiration_time");
      // const midnightLogout = await Utils.retrieveDataFromAsyncStorage("MIDNIGHT_LOGOUT");
      //const loginTime = await Utils.retrieveDataFromAsyncStorage("LOGIN_TIME");
      const moment = require('moment');

      if (expirationTime && loginTime && midnightLogout) {
        var currentDateTime = currentDate.getTime();
        var loginDate = new Date(loginTime);
        var loginDateTime = loginDate.getTime();
        var duration = (currentDateTime - loginDateTime) / 1000;

        if (duration > expirationTime) {
          console.log('Time Out !!, do Logout');
        } else {
          if (midnightLogout === 'Y') {
            var currentDay = currentDate.getDate();
            var loginDate = new Date(loginTime);
            var loginDay = loginDate.getDate();

            if (currentDay > loginDay) {
              console.log('Midnight Time Out!!! Stay in Log in Page ');
            } else {
              this.props.navigation.navigate('Drawer');
            }
          }
        }
      }
    }
  };

  forceLogin() {
    Utils.storeDataToAsyncStorage('USER_NAME', 'SHAMEER.KAPPIL@INOAPPS.COM');
    this.getReplaceReason().then(() => {
      this.getStaticData().then(() => {
        this.getUsageType().then(() => {
          this.setState({isLoading: false});
          setTimeout(() => {
            this.props.navigation.navigate('Drawer');
          }, 100);
        });
      });
    });
  }

  // MARK: API

  getLogin(envURL) {
    if (envURL == 'https://www.google.com') {
      return alert('Please enter right Environment!');
    }

    if (!this.state.username) {
      return Alert.alert('', 'Please enter a username.', [{text: 'OK'}], {
        cancelable: false,
      });
    } else if (!this.state.password) {
      return Alert.alert('', 'Please enter a password.', [{text: 'OK'}], {
        cancelable: false,
      });
    } else {
      this.setState({isLoading: true});
      const params = [this.state.username, this.state.password];

      this.api['getLogin'].apply(this, params).then(result => {
        this.setState({isLoading: false});
        console.log('Response API ok: >>>>', result);

        if (result.ok) {
          console.log('Response API ok: ', result.data);

          if (result.data.user_name) {
            Utils.storeDataToAsyncStorage(
              'USER_NAME',
              result.data.user_name,
            ).then(() => {
              //   Utils.storeDataToAsyncStorage("expiration_time",result.data.expirationn_time).then(() => {
              //Utils.storeDataToAsyncStorage("MIDNIGHT_LOGOUT",result.data.MIDNIGHT_LOGOUT).then(() => {
              // Utils.storeDataToAsyncStorage("PROD_CONFIG_ACCESS", result.data.PROD_CONFIG_ACCESS).then(() => {
              //  Utils.storeDataToAsyncStorage("GRN_ACCESS", result.data.GRN_ACCESS).then(() => {
              //  Utils.storeDataToAsyncStorage("PASSWORD",this.state.password).then(() => {
              // Utils.storeDataToAsyncStorage("REMEMBER_ME",this.state.isChecked).then(() => {
              //   Utils.storeDataToAsyncStorage("LOGIN_TIME", new Date()).then(() => {
              //  this.getReplaceReason().then(() => {
              //this.getStaticData().then(() => {
              //   this.getUsageType().then(() => {
              this.setState({isLoading: false});
              setTimeout(() => {
                this.props.navigation.navigate('Drawer');
              }, 100);
            });
            //});
            //  });
            // })
            // })
            //   })
            //  })
            // })
            // })
            //})
            //})
          } else {
            //Utils.storeDataToAsyncStorage("USER_NAME",result.data.USER_NAME).then(() =>{
            // this.props.navigation.navigate("Drawer");})
            setTimeout(() => {
              Alert.alert(
                '',
                'Invalid username and password.',
                [{text: 'OK'}],
                {cancelable: false},
              );
            }, 100);
          }
        } else {
          this.setState({isLoading: false});
          setTimeout(() => {
            console.log(
              'Response API: failed',
              result.status + ' - ' + result.problem,
            );
            Alert.alert(
              'Oops',
              'Please check the enviroment and login details.',
              // "There seems to be a problem with then connection. Please try again later.",
              [{text: 'OK'}],
              {cancelable: false},
            );
          }, 100);
        }
      });
    }
  }

  checkRememberMe = async () => {
    console.log('Login state', this.state);

    //const username = await Utils.retrieveDataFromAsyncStorage("USER_NAME");
    //const password = await Utils.retrieveDataFromAsyncStorage("PASSWORD");
    //const rememberMe = await Utils.retrieveDataFromAsyncStorage("REMEMBER_ME");

    /*  if (rememberMe && username) {
      this.setState({
        username: username,
        isChecked: rememberMe,
        password: password,
    });
    }
*/
    console.log('Login state', this.state);
  };

  getStaticData = async () => {
    // TODO: retrieve username from Async Storage (WIP)

    //const username = await Utils.retrieveDataFromAsyncStorage("USER_NAME");
    const response = await this.api.getStaticData(username);

    if (response.ok) {
      console.log('Response API ok: ', response);

      // TODO: decode data
      staticDataDecode = JSON.parse(
        Base64.decode(response.data.items[0].json_data),
      );

      // TODO: save static data to DB
      await DBPCStaticDataHelper.saveStaticData(staticDataDecode);
    } else {
      console.log(
        'Response API: failed',
        response.status + ' - ' + response.problem,
      );
    }
  };

  getReplaceReason = async () => {
    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');
    const response = await this.api.getReplaceReason(username);

    if (response.ok) {
      console.log('Response API ok: ', response);
      await DBPCStaticDataHelper.saveReplaceReasons(response.data.items);
      return;
    } else {
      console.log(
        'Response API: failed',
        response.status + ' - ' + response.problem,
      );
      return;
    }
  };

  getUsageType = async () => {
    const username = await Utils.retrieveDataFromAsyncStorage('USER_NAME');
    const response = await this.api.getUsageType();

    if (response.ok) {
      console.log('Response API ok: ', response);
      await DBPCStaticDataHelper.saveUsageTypes(response.data.items);
    } else {
      console.log(
        'Response API: failed',
        response.status + ' - ' + response.problem,
      );
    }
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Spinner visible={this.state.isLoading} />
        <View style={styles.container}>
          <ImageBackground
            source={Images.loginBackground}
            style={styles.backgroundImage}>
            <View style={styles.centerView}>
              <View style={styles.inputView}>
                <Text style={styles.title}>ENVIRONMENT</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter the environment"
                  value={this.state.environment}
                  onChangeText={text => this.setState({environment: text})}
                />
              </View>

              <View style={styles.lineView} />

              <View style={styles.inputView}>
                <Text style={styles.title}>USERNAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  value={this.state.username}
                  onChangeText={text => this.setState({username: text})}
                />
              </View>

              <View style={styles.lineView} />

              <View style={styles.inputView}>
                <Text style={styles.title}>PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  secureTextEntry={true}
                  value={this.state.password}
                  onChangeText={text => this.setState({password: text})}
                />
              </View>

              {/* <View style={styles.checkboxView}>
                <CheckBox
                  checkboxStyle={styles.checkbox}
                  onChange={checked =>
                    this.setState({
                      isChecked: !this.state.isChecked,
                    })
                  }
                  checked={this.state.isChecked}
                  label="Remember Me"
                />
              </View> */}

              <TouchableOpacity
                onPress={() => {
                  this.getEnvironment();
                  //this.checkEnvironment();
                  // this.getLogin();
                }}
                style={styles.loginButton}>
                <View>
                  <Text style={styles.loginText}>LOGIN</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
