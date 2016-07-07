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
  RefreshControl,
  Image,
  ScrollView
} from "react-native";
import YANavigator from 'react-native-ya-navigator';
import { CompassAPI } from "./compass_api";
import { SchoolSelectionView } from "./login_ui";
const compassAPI = new CompassAPI();
var ScrollableTabView = require("react-native-scrollable-tab-view");
import { Button, Card } from 'react-native-material-design';
import renderIf from "render-if";

class NewsView extends Component {
  async refresh() {
    this.setState({refreshing: true});
    var homeFeed = await compassAPI.homeContent();
    if (homeFeed) {
      var newsItems = homeFeed["news"];
      this.setState({
        items: newsItems,
        refreshing: false
      });
    } else {
      console.log("Could not refresh home feed. Are you logged in?");
    }
  }
  constructor(props, context) {
    super(props, context);
    this.state = {items:[], refreshing: false}
    this.refresh();
  }
  render() {
    let cardArray = this.state.items.map((item, index) => {return(<Card key={index}>
          <Card.Body>
            <View style={{flexDirection:"row", flexWrap:"nowrap", alignItems:"center", justifyContent:"center", marginBottom: 10}}>
            <Text style={{fontSize: 26, flex:1}}>{item["UploadedBy"]}</Text>
            <Image source={{uri: "https://"+compassAPI.compassURL+item["UserImageUrl"]}} style={{width:76, height:76, borderRadius: 38}} />
            </View>
            <Text>{item["Content"]}</Text>
          </Card.Body>
        </Card>)});
    return (
      <ScrollView contentContainerStyle={{flex: this.state.items.length === 0 ? 1 : 0}} refreshControl={
        <RefreshControl refreshing={this.state.refreshing} onRefresh={this.refresh.bind(this)} />
      }>
        {cardArray}
        {renderIf(this.state.items.length === 0)(
          <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <Text style={{fontSize: 28, textAlign: "center"}}>No items.</Text>
          </View>
        )}
      </ScrollView>
    );
  }
}

class ScheduleView extends Component {
  async refresh() {
    this.setState({refreshing: true});
    var homeFeed = await compassAPI.homeContent();
    if (homeFeed) {
      var scheduleItems = homeFeed["schedule"];
      this.setState({
        items: scheduleItems,
        refreshing: false
      });
    } else {
      console.log("Could not refresh today's schedule. Are you logged in?");
    }
  }
  constructor(props, context) {
    super(props, context);
    this.state = {items:[], refreshing: false}
    this.refresh();
  }
  render() {
    let cardArray = this.state.items.map((item, index) => {return(<Card key={index}>
          <Card.Body>
            <Text style={{fontSize: 26}}>{item["SubjectShort"]}</Text>
            <Text>{item["ActivityName"]}</Text>
            <Text>{item["Start"]+" - "+item["Finish"]}</Text>
            {renderIf(item["OldLocation"] !== "")(
              <Text style={{textDecorationLine: "line-through"}}>{item["OldLocation"]}</Text>
            )}
            <Text>{item["Location"]}</Text>
            <Text style={{textDecorationLine: item["CoveringManager"] !== "" ? "line-through" : "none"}}>{item["OriginalManager"]}</Text>
            {renderIf(item["CoveringManager"] !== "")(
              <Text>{item["CoveringManager"]}</Text>
            )}
          </Card.Body>
        </Card>)});
    return (
      <ScrollView contentContainerStyle={{flex: this.state.items.length === 0 ? 1 : 0}} refreshControl={
        <RefreshControl refreshing={this.state.refreshing} onRefresh={this.refresh.bind(this)} />
      }>
        {cardArray}
        {renderIf(this.state.items.length === 0)(
          <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <Text style={{fontSize: 28, textAlign: "center"}}>There's nothing on today.</Text>
          </View>
        )}
      </ScrollView>
    );
  }
}

class DebugView extends Component {
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
      this.props.navigator.push({component: SchoolSelectionView, props: {mainView: this}});
    }
  }
  refresh() {
    this.refs.newsView.refresh();
    this.refs.scheduleView.refresh();
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
          <NewsView ref="newsView" tabLabel="News" {...this.props} />
          <ScheduleView ref="scheduleView" tabLabel="Schedule" {...this.props} />
          <DebugView ref="debugView" tabLabel="Debug" {...this.props} />
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