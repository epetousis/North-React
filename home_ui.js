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
  ActivityIndicator,
  Image,
  ScrollView
} from "react-native";
import YANavigator from 'react-native-ya-navigator';
import { CompassAPI } from "./compass_api";
import { SchoolSelectionView } from "./login_ui";
const compassAPI = new CompassAPI();
var ScrollableTabView = require("react-native-scrollable-tab-view");
import { Button, Card } from 'react-native-material-design';

class NewsView extends Component {
  async refresh() {
    var homeFeed = await compassAPI.homeContent();
    var newsItems = homeFeed["news"];
    console.log(newsItems);
    this.setState({
      items: newsItems
    });
  }
  constructor(props, context) {
    super(props, context);
    this.state = {items:[]}
    this.refresh();
  }
  render() {
    let cardArray = this.state.items.map((item, index) => {return(<Card key={index}>
          <Card.Body>
            <Text style={{fontSize: 26}}>{item["UploadedBy"]}</Text>
            <Text>{item["Content"]}</Text>
          </Card.Body>
        </Card>)});
    return (
      <ScrollView>
        { cardArray }
      </ScrollView>
    );
  }
}

class ScheduleView extends Component {
  logOut() {
    compassAPI.logOut();
    this.props.navigator.push({component: SchoolSelectionView});
  }
  render() {
    return (
      <Button text="Log out" style={{margin: 20}} onPress={() => this.logOut()}>Log out</Button>
    );
  }
}

class MainTabbedView extends Component {
  async checkCompassApi() {
    var apiKey = await compassAPI.retrieveSettings();
    if (!apiKey) {
      this.props.navigator.push({component: SchoolSelectionView});
    }
  }
  constructor(props, context) {
    super(props, context);
    this.checkCompassApi();
  }
  static navigationDelegate = {
    id: "tabbedViewScene",
    renderTitle(props) {
      return <Text style={{fontSize: 18, color: "#ffffff"}}>North</Text>
    }
  }
  render() {
    return (
      <YANavigator.Scene delegate={this} style={styles.container}>
        <ScrollableTabView tabBarBackgroundColor="#2980b9" tabBarUnderlineColor="lightblue" tabBarActiveTextColor="white" tabBarInactiveTextColor="white" >
          <NewsView tabLabel="News" {...this.props} />
          <ScheduleView tabLabel="Schedule" {...this.props} />
        </ScrollableTabView>
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

export default MainTabbedView;