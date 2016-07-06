/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  StatusBar
} from 'react-native';
import YANavigator from 'react-native-ya-navigator';

import { CompassLogin, CompassAPI } from "./compass_api";
import { LoginView, SchoolSelectionView } from "./login_ui";

class North extends Component {
  render() {
    return (
      <View style={{flex: 1}}>
      <StatusBar barStyle="light-content" />
      <YANavigator
        initialRoute={{
          component: SchoolSelectionView,
        }}
        navBarStyle={{
          backgroundColor: '#2980b9',
        }}
        navBarBackBtn={{
          textStyle: {
            color: '#fff'
          },
        }}
     />
     </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('North', () => North);
