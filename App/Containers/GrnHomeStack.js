import React, { Component } from 'react';
import { TouchableOpacity } from 'react-native';
// import { StackNavigator} from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack';

import IOSIcon from "react-native-vector-icons/Ionicons";
import Home from '././GrnHome'
import styles from './Styles/GrnHomeStackStyle'
import { DrawerActions } from 'react-navigation';

const GrnHomeStack = createStackNavigator({
    Home: {
        screen: Home,
        navigationOptions:({navigation}) => ({
            title: "HOME",
            headerLeft:(
              <TouchableOpacity onPress={() =>
                  navigation.dispatch(DrawerActions.openDrawer())}>
                <IOSIcon style={styles.menuButton} name="ios-menu" size={30} />
              </TouchableOpacity>
            )
        })
    }
})

export default GrnHomeStack;
