"use strict";
import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ListView,
  RecyclerViewBackedScrollView,
  TouchableHighlight,
  Alert,
  ActivityIndicator
} from "react-native";
import YANavigator from 'react-native-ya-navigator';
import Button from "apsl-react-native-button";
import { CompassAPI } from "./compass_api";
import { SchoolSelectionView } from "./login_ui";
const compassAPI = new CompassAPI();

class HomeView extends Component {
  async checkCompassApi() {
    var compass = new CompassAPI();
    var apiKey = await compass.retrieveApiKey();
    if (!apiKey) {
      this.props.navigator.push({component: SchoolSelectionView});
    }
  }
  constructor(props, context) {
    super(props, context);
    this.checkCompassApi();
  }
  static navigationDelegate = {
    id: "homeScene",
    renderTitle(props) {
      return <Text style={{fontSize: 18, color: "#ffffff"}}>North</Text>
    }
  }
  logOut() {
    compassAPI.logOut();
    this.props.navigator.push({component: SchoolSelectionView});
  }
  render() {
    return (
      <YANavigator.Scene delegate={this} style={styles.container}>
      <Button style={{margin: 20}} onPress={() => this.logOut()}>Log out</Button>
      </YANavigator.Scene>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loginHUDContainer: {
    flex: 1,
    position:"absolute",
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    justifyContent: "center",
    alignItems:"center"
  },
  loginHUD: {
    backgroundColor:"#222",
    borderRadius: 12,
    width: 220,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    textAlign: "center"
  },
  row: {
    margin:15,
    fontSize: 16,
    textAlign: "center",
    justifyContent: "center"
  }
});

export default HomeView;