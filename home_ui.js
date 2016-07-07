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
import renderIf from "render-if";

class NewsView extends Component {
  async refresh() {
    var homeFeed = await compassAPI.homeContent();
    if (homeFeed) {
      var newsItems = homeFeed["news"];
      this.setState({
        items: newsItems
      });
    } else {
      console.log("Could not refresh home feed. Are you logged in?");
    }
  }
  constructor(props, context) {
    super(props, context);
    this.state = {items:[]}
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
      <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        {renderIf(this.state.items.length > 0)(
          <ScrollView>
            {cardArray}
          </ScrollView>
        )}
        {renderIf(this.state.items.length === 0)(
          <Text style={{fontSize: 36, textAlign: "center"}}>No items.</Text>
        )}
      </View>
    );
  }
}

class ScheduleView extends Component {
  async refresh() {
    var homeFeed = await compassAPI.homeContent();
    if (homeFeed) {
      var scheduleItems = homeFeed["schedule"];
      this.setState({
        items: scheduleItems
      });
    } else {
      console.log("Could not refresh today's schedule. Are you logged in?");
    }
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
      <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        {renderIf(this.state.items.length > 0)(
          <ScrollView>
            {cardArray}
          </ScrollView>
        )}
        {renderIf(this.state.items.length === 0)(
          <Text style={{fontSize: 28, textAlign: "center"}}>There's nothing on today.</Text>
        )}
      </View>
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