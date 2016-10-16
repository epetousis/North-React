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
  TouchableNativeFeedback,
  Alert,
  ActivityIndicator,
  Platform,
  Navigator,
  Image
} from "react-native";
import { CompassLogin, CompassAPI } from "./compass_api";
const loginObject = new CompassLogin();
import YANavigator from 'react-native-ya-navigator';

class SchoolSelectionView extends Component {
  async performSearchAndReload(query) {
    var list = await loginObject.searchSchools(query);
    this.setState({
      dataSource: this.ds.cloneWithRows(list),
    });
  }
  constructor(props, context) {
    super(props, context);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: this.ds,
    }
  }
  _pressRow(sectionID, rowID, rowData, highlightRow) {
    this.props.navigator.push({
      component: LoginView,
      props: {
        school: rowData,
        mainView: this.props.mainView
      }
    });
    highlightRow(sectionID, rowID);
  }
  _renderRow(rowData: string, sectionID: number, rowID: number, highlightRow: (sectionID: number, rowID: number) => void) {
    if (Platform.OS === "android") {
      return (
        <TouchableNativeFeedback underlayColor="#cccccc" onPress={() => {this._pressRow(sectionID, rowID, rowData, highlightRow)}}>
          <View>
          <Text style={styles.row}>
            {rowData}
          </Text>
          </View>
        </TouchableNativeFeedback>
      );
    } else {
      return (
        <TouchableHighlight underlayColor="#cccccc" onPress={() => {this._pressRow(sectionID, rowID, rowData, highlightRow)}}>
          <View>
          <Text style={styles.row}>
            {rowData}
          </Text>
          </View>
        </TouchableHighlight>
      );
    }
  }
  _renderSeperator(sectionID: number, rowID: number, adjacentRowHighlighted: bool) {
    return (
    <View
      key={rowID}
      style={{
      height: 1,
      backgroundColor: '#CCCCCC',
      }}
    />
    );
  }
  static navigationDelegate = {
    id: "schoolSelectScene",
    navBarBackgroundColor: '#103260',
    sceneConfig: Platform.OS === 'ios' && Navigator.SceneConfigs.FloatFromBottom,
    renderTitle(props) {
      return <Text style={{fontSize: 18, color: "#ffffff"}}>Select your school</Text>
    },
    renderNavBarLeftPart() {
      return null;
    }
  }
  render() {
    return (
      <YANavigator.Scene delegate={this} style={styles.container}>
        <TextInput style={styles.textField} placeholder="School" onChangeText={(text) => this.performSearchAndReload(text)} />
        <ListView renderScrollComponent={(props) => <RecyclerViewBackedScrollView {...props}/>} dataSource={this.state.dataSource} renderRow={this._renderRow.bind(this)} renderSeparator={this._renderSeperator.bind(this)}/>
      </YANavigator.Scene>
    );
  }
}

class ProgressHUD extends Component {
  render() {
    return (
      <View style={styles.loginHUDContainer}>
        <View style={styles.loginHUD}>
          <Text style={{textAlign: "center", fontSize: 24, color: "white", paddingTop: 10}}>Logging in...</Text>
          <ActivityIndicator style={{padding: 10}} size="large" color={'#fff'}/>
        </View>
      </View>
    );
  }
}

class LoginView extends Component {
  static navigationDelegate = {
    id: "loginScene",
    navBarBackgroundColor: '#103260',
    renderTitle(props) {
      return <Text style={{fontSize: 18, color: "#ffffff"}}>Log In</Text>
    }
  }
  async downloadSchoolLogo() {
    var schoolLogoURL = await loginObject.schoolLogoURL(this.props.school);
    this.setState({
      schoolLogoURL: schoolLogoURL
    });
  }
  constructor(props, context) {
    super(props, context);
    this.downloadSchoolLogo();
    this.state = {
      progressHUD: (<View />)
    };
  }
  async login() {
    this.setState({
      progressHUD: (<ProgressHUD />)
    });
    var apiKey = await loginObject.login(this.props.school, this.state.username, this.state.password);
    this.setState({
      progressHUD: (<View />)
    });
    if (apiKey) {
      this.props.navigator.popToTop();
      this.props.mainView.refresh();
    } else {
      alert("An error occurred while logging into Compass.");
    }
  }
  render() {
    return (
      <YANavigator.Scene delegate={this} style={styles.container}>
        <View style={{flexDirection:"row", alignItems:"center", justifyContent:"center", backgroundColor:"#fff"}}>
        <Image style={{height: 100, width: 100, margin: 10}} resizeMode="contain" source={{uri: this.state.schoolLogoURL}} />
        <Text style={styles.title} adjustsFontSizeToFit={true}>{this.props.school}</Text>
        </View>
        <TextInput ref="usernameField" style={styles.textField} placeholder="Username" autoCorrect={false} autoCapitalize="none" onChangeText={(username) => this.setState({username})} onSubmitEditing={() => this.refs.passwordField.focus()} returnKeyType="next" />
        <TextInput ref="passwordField" style={styles.textField} placeholder="Password" secureTextEntry={true} returnKeyType="go" onChangeText={(password) => this.setState({password})} onSubmitEditing={() => this.login()} />
        <Image style={{width: null, height:50}} resizeMode="contain" source={require('./img/Compass.png')} />
        {this.state.progressHUD}
      </YANavigator.Scene>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#103260',
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
    fontSize: 24,
    textAlign: "center"
  },
  row: {
    margin:15,
    fontSize: 16,
    textAlign: "center",
    justifyContent: "center",
    color: "white"
  },
  textField: {
    height: 60,
    margin: 10,
    color: "white"
  }
});

export { LoginView, SchoolSelectionView };
