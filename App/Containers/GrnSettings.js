import React, { Component } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from "react-native";
import { connect } from "react-redux";
import { Images } from "../Themes";
import Utils from "../Utils/Utils";
import Config from "react-native-config";
import SyncHelper from "../Sync/SyncHelper";
import Spinner from "react-native-loading-spinner-overlay";
import DeviceInfo from "react-native-device-info";

// Add Actions - replace 'Your' with whatever your reducer is called :)
// import YourActions from '../Redux/YourRedux'

// Styles
import styles from "./Styles/GrnSettingsStyle";
import EnvironmentVar from "../Config/EnvironmentVar";
import { NavigationActions, StackActions } from "react-navigation";

class GrnSettings extends Component {
  static navigationOptions = {
    title: "SETTINGS",
  };
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      isLoading: false,
      envUrl: "",
      environment: "",
    };
  }
  async componentDidMount() {
    const environment = await Utils.retrieveDataFromAsyncStorage("ENVIRONMENT");

    console.log(environment, "environmentenvironmentenvironment");
    this.setState({
      isLoading: true,
      environment: environment,
    });
    EnvironmentVar()
      .then((res) => {
        console.log("coming inside res", res);
        this.setState({
          envUrl: res,
        });
      })
      .catch((err) => {
        console.log("IN error", err);
      });
    this.initStates();
  }

  initStates = async () => {
    const username = await Utils.retrieveDataFromAsyncStorage("USER_NAME");
    this.setState({
      username: username,
      isLoading: false,
    });
  };

  showLogoutAlert = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: this.navigateBackToLogin },
      ],
      { cancelable: false }
    );
  };

  navigateBackToLogin = async () => {
    await Utils.removeItemValue("USER_NAME");
    await Utils.removeItemValue("ENVIRONMENT");
    this.props.navigation.navigate("Login");
  };

  navigateBackToLogin = () => {
    return this.props.navigation.navigate("Login");

    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: "loginStack" })],
    });
    return this.props.navigation.dispatch(resetAction);
  };
  refreshData = async () => {
    const { envUrl } = this.state;
    this.setState({
      isLoading: true,
    });

    await SyncHelper.getPurchaseOrderApi(envUrl);

    this.setState({
      isLoading: false,
    });
  };

  render() {
    const appVersion = DeviceInfo.getVersion();
    const buildNumber = DeviceInfo.getBuildNumber();
    const { envUrl, environment } = this.state;
    return (
      <SafeAreaView style={styles.container}>
        <Spinner
          visible={this.state.isLoading}
          textContent="Refreshing data..."
        />

        <View style={styles.container}>
          <ImageBackground
            source={Images.grnSettingsBackground}
            style={styles.backgroundImage}
          >
            <View style={styles.info}>
              <Text style={styles.infoTitle}>USERNAME:</Text>
              <Text style={styles.infoText}>{this.state.username}</Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.infoTitle}>ENVIRONMENT:</Text>
              <Text style={styles.infoText}>{environment}</Text>
            </View>

            {/* <View style={styles.info}>
              <Text style={styles.infoTitle}>VERSION:</Text>
              <Text style={styles.infoText}>{Config.DB_VERSION}</Text>
            </View> */}
            {/* <View style={styles.info}>
              <Text style={styles.infoTitle}>DATABASE:</Text>
              <Text style={styles.infoText}>{Config.ENV}</Text>
            </View> */}
            <View style={styles.info}>
              <Text style={styles.infoTitle}>APP VERSION:</Text>
              <Text style={styles.infoText}>
                {"v" + appVersion + "(" + buildNumber + ")"}
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={this.refreshData.bind(this)}
                style={styles.refreshDataButtonStyle}
              >
                <View>
                  <Text style={styles.buttonText}>REFRESH DATA</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.showLogoutAlert.bind(this)}
                style={styles.logoutButtonStyle}
              >
                <View>
                  <Text style={styles.buttonText}>LOG OUT</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </SafeAreaView>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(GrnSettings);
