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
  ScrollView,
  DatePickerIOS,
  DatePickerAndroid,
  Platform,
  AsyncStorage
} from "react-native";
import YANavigator from 'react-native-ya-navigator';
import { CompassAPI } from "./compass_api";
import { SchoolSelectionView } from "./login_ui";
const compassAPI = new CompassAPI();
var ScrollableTabView = require("react-native-scrollable-tab-view");
import { Button, Card, Ripple } from 'react-native-material-design';
import renderIf from "render-if";
import IconTabBar from "./icon_tab_bar";
import Icon from 'react-native-vector-icons/MaterialIcons';

class NewsView extends Component {
  async retrieveHiddenItems() {
    var hiddenItemsString = await AsyncStorage.getItem("@North:hiddenItems");
    var hiddenItems = JSON.parse(hiddenItemsString);
    return hiddenItems;
  }
  async refresh() {
    this.setState({
      refreshing: true
    });
    var hiddenItems = await this.retrieveHiddenItems();
    var newsItems = await compassAPI.newsFeed();
    if (newsItems) {
      if (!this.state.showHiddenItems) {
        var titles = [];
        for (var index in newsItems) {
          titles.push(newsItems[index]["title"]);
        }
        for (var index in hiddenItems) {
          var searchIndex = titles.indexOf(hiddenItems[index]);
          if (searchIndex >= 0) {
            newsItems.splice(searchIndex, 1);
            titles.splice(titles.indexOf(hiddenItems[index]), 1);
          }
        }
      }
      this.setState({
        items: newsItems,
        refreshing: false,
        hiddenItems: hiddenItems
      });
    } else {
      console.log("Could not refresh home feed. Are you logged in?");
    }
  }
  constructor(props, context) {
    super(props, context);
    this.state = {items:[], hiddenItems: [], refreshing: false, showHiddenItems: false};
  }
  componentDidMount() {
    this.refresh();
  }
  async hidePost(title) {
    var hiddenItems = await this.retrieveHiddenItems();
    if (hiddenItems === null) {
      hiddenItems = [];
    }
    hiddenItems.push(title);
    this.setState({hiddenItems: hiddenItems});
    await AsyncStorage.setItem("@North:hiddenItems", JSON.stringify(hiddenItems));
    this.refresh();
  }
  async unhidePost(title) {
    var hiddenItems = await this.retrieveHiddenItems();
    if (hiddenItems === null) {
      hiddenItems = [];
      await AsyncStorage.setItem("@North:hiddenItems", JSON.stringify(hiddenItems));
      return;
    }
    hiddenItems.splice(hiddenItems.indexOf(title), 1);
    this.setState({hiddenItems: hiddenItems});
    await AsyncStorage.setItem("@North:hiddenItems", JSON.stringify(hiddenItems));
    this.refresh();
  }
  toggleHiddenItems() {
    this.setState({showHiddenItems: !this.state.showHiddenItems});
    this.refresh();
  }
  itemIsHidden(title) {
    if (this.state.hiddenItems === null) {
      return false;
    }
    return this.state.hiddenItems.indexOf(title) >= 0;
  }
  render() {
    let cardArray = this.state.items.map((item, index) => {return(<Card key={index}>
          <Card.Body>
            <View style={styles.cardHeader}>
            <View style={{flex: 1}}>
            <Text style={{fontSize: 21, marginBottom: 5}}>{item["title"]}</Text>
            <Text style={{fontSize: 18, marginBottom: 10}}>By {item["uploader"]}</Text>
            </View>
            <Image source={{uri: "https://"+compassAPI.compassURL+item["userImageUrl"]}} style={{width:76, height:76, borderRadius: 38}} />
            </View>
            <Text>{item["content"]}</Text>
            <View style={{flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: "flex-end"}}>
            <Ripple style={{width: 40, height: 40, justifyContent: "center", alignItems: "center"}} onPress={() => this.itemIsHidden(item["title"]) ? this.unhidePost(item["title"]) : this.hidePost(item["title"])}><Icon name={this.itemIsHidden(item["title"]) ? "remove-red-eye" : "close"} size={30} color="#cccccc" /></Ripple>
            </View>
          </Card.Body>
        </Card>)});
    return (
      <ScrollView contentContainerStyle={{flex: this.state.items.length === 0 ? 1 : 0}} refreshControl={
        <RefreshControl refreshing={this.state.refreshing} onRefresh={this.refresh.bind(this)} />
      }>
        <Button text={(this.state.showHiddenItems) ? "Hide hidden items" : "Show hidden items"} onPress={this.toggleHiddenItems.bind(this)} />
        {cardArray}
        {renderIf(this.state.items.length === 0)(
          <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <Text style={{fontSize: 28, textAlign: "center", marginBottom: 10}}>No news items.</Text>
            <Text style={{fontSize: 20, textAlign: "center"}}>Pull to check for new items.</Text>
          </View>
        )}
      </ScrollView>
    );
  }
}

class ScheduleView extends Component {
  async refresh() {
    this.setState({
      refreshing: true
    });
    var schedule = await compassAPI.scheduleForDate(this.state.date.toISOString().substring(0,10));
    if (schedule) {
      this.setState({
        items: schedule,
        refreshing: false
      });
    } else {
      console.log("Could not refresh today's schedule. Are you logged in?");
    }
  }
  constructor(props, context) {
    super(props, context);
    this.state = {items:[], refreshing: false, date: new Date(), showiOSDatePicker: false};
  }
  componentDidMount() {
    this.refresh();
  }
  async changeDate(date) {
    await this.setState({date: date});
    this.refresh();
  }
  async toggleDatePicker() {
    if (Platform.OS === "ios") {
      this.setState({showiOSDatePicker: !this.state.showiOSDatePicker})
    } else if (Platform.OS === "android") {
      const {action, year, month, day} = await DatePickerAndroid.open({date: this.state.date});
      if (action === DatePickerAndroid.dateSetAction) {
        var date = new Date();
        date.setFullYear(year);
        date.setMonth(month);
        date.setDate(day);
        this.changeDate(date);
      }
    }
  }
  classIsCancelled(classItem) {
    if (classItem === null) {
      return false;
    }
    return classItem["bgColor"] === "#EFEFEF";
  }
  render() {
    let cardArray = this.state.items.map((item, index) => {return(<Card key={index}>
          <Card.Body>
            {renderIf(this.classIsCancelled(item))(
              <Text style={{fontSize: 26, color: "red"}}>CANCELLED</Text>
            )}
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
      <View style={{flex: 1}}>
        <ScrollView contentContainerStyle={{flex: this.state.items.length === 0 ? 1 : 0}} refreshControl={
          <RefreshControl refreshing={this.state.refreshing} onRefresh={this.refresh.bind(this)} />
        }>
          <Button text={this.state.date.toDateString()} onPress={this.toggleDatePicker.bind(this)} />
          {cardArray}
          {renderIf(this.state.items.length === 0)(
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
              <Text style={{fontSize: 28, textAlign: "center", marginBottom: 10}}>There's nothing on this date.</Text>
              <Text style={{fontSize: 20, textAlign: "center"}}>Pull to check for new classes.</Text>
            </View>
          )}
        </ScrollView>
        {renderIf(this.state.showiOSDatePicker)(
          <DatePickerIOS date={this.state.date} mode="date" onDateChange={this.changeDate.bind(this)} />
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

class LearningTasksView extends Component {
  async refresh() {
    this.setState({
      refreshing: true
    });
    var learningTasks = await compassAPI.learningTasks();
    if (learningTasks) {
      this.setState({
        items: learningTasks,
        refreshing: false
      });
    } else {
      console.log("Could not refresh home feed. Are you logged in?");
    }
  }
  constructor(props, context) {
    super(props, context);
    this.state = {items:[], refreshing: false};
  }
  componentDidMount() {
    this.refresh();
  }
  statusColour(dueDateString, student) {
    if (dueDateString !== "") {
      var dueDate = new Date(dueDateString);
      var today = new Date();
      if (dueDate.getTime() - today.getTime() < 0) {
        var overdue = true;
      } else {
        var overdue = false;
      }
    } else {
      var overdue = false;
    }

    var submitted = student["submittedTimestamp"] !== "";
    if (submitted) {
      var submissionDate = new Date(student["submittedTimestamp"]);
      var overdueSubmission = dueDate.getTime() - submissionDate.getTime() < 0;
    }
    if (overdue && !submitted) {
      return "red";
    } else if (overdueSubmission && submitted) {
      return "yellow";
    } else if (!overdue && !submitted) {
      return "lightblue";
    } else if (!overdueSubmission && submitted) {
      return "green";
    }
  }
  render() {
    let cardArray = this.state.items.map((item, index) => {return(<Card key={index}>
          <Card.Body>
            <View style={{flexDirection:"row", flexWrap:"nowrap", alignItems:"center", justifyContent:"center", marginBottom: 10}}>
            <Text style={{fontSize: 26, flex:1}}>{item["name"]}</Text>
            <View style={{width:36, height:36, borderRadius: 18, backgroundColor: this.statusColour(item["dueDateTimestamp"], item["students"][0])}} />
            </View>
            <Text>{item["activityName"]}</Text>
          </Card.Body>
        </Card>)});
    return (
      <ScrollView contentContainerStyle={{flex: this.state.items.length === 0 ? 1 : 0}} refreshControl={
        <RefreshControl refreshing={this.state.refreshing} onRefresh={this.refresh.bind(this)} />
      }>
        {cardArray}
        {renderIf(this.state.items.length === 0)(
          <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <Text style={{fontSize: 28, textAlign: "center", marginBottom: 10}}>No learning tasks.</Text>
            <Text style={{fontSize: 20, textAlign: "center"}}>Pull to check for new learning tasks.</Text>
          </View>
        )}
      </ScrollView>
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
    this.refs.learningTasksView.refresh();
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
        <ScrollableTabView tabBarBackgroundColor="#fefefe" tabBarUnderlineColor="lightblue" tabBarActiveTextColor="#000" tabBarInactiveTextColor="#aaa" tabBarPosition="bottom" renderTabBar={() => <IconTabBar drawTopBorder="true" />} >
          <NewsView ref="newsView" tabLabel="ios-paper" {...this.props} />
          <ScheduleView ref="scheduleView" tabLabel="ios-clock" {...this.props} />
          <LearningTasksView ref="learningTasksView" tabLabel="md-create" {...this.props} />
          <DebugView ref="debugView" tabLabel="md-help" {...this.props} />
        </ScrollableTabView>
      </YANavigator.Scene>
    );
  }
}

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection:"row",
    flexWrap:"nowrap",
    alignItems:"center",
    justifyContent:"center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)"
  },
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
