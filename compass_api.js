"use strict";

let apiKeyURL = "/services/admin.svc/getapikey";
let schoolDetailsURL = "/services/admin.svc/getschooldetailbasic";
let schoolNameURL = "/services/admin.svc/getschoolname";

let serverDomains = ["cl1.vic.jdlf.com.au",
"bn1.vic.jdlf.com.au",
"kw1.vic.jdlf.com.au",
"lbrw1.vic.jdlf.com.au",
"lbmr1.vic.jdlf.com.au",
"ed1.vic.jdlf.com.au"]

import { AsyncStorage } from "react-native";

/**
 * Send a JSON request, get a JSON response. Simple.
 */
async function jsonPOSTRequest(URL, body, apiKey) {
  var headers = { "Content-Type": "application/json", };
  if (apiKey) {
    headers["CompassApiKey"] = apiKey;
  }
  var response = await fetch(URL, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body)
  });
  var jsonResponse = await response.json();
  return jsonResponse;
}

class CompassAPI {
  async retrieveSettings() {
    var apiKey = await AsyncStorage.getItem("@North:apiKey");
    var compassURL = await AsyncStorage.getItem("@North:compassURL");
    if (apiKey !== null && compassURL !== null) {
      this.apiKey = apiKey;
      this.compassURL = compassURL;
      return [apiKey, compassURL];
    }
    return null;
  }

  async logOut() {
    await AsyncStorage.setItem("@North:apiKey", "");
    await AsyncStorage.setItem("@North:compassURL", "");
  }

  constructor() {
    this.retrieveSettings();
  }

  async homeContent() {
    await this.retrieveSettings();
    try {
      var homeContent = await jsonPOSTRequest("https://"+this.compassURL+"/services/ios.svc/getcontent", {}, this.apiKey);
      return homeContent["d"];
    } catch(error) {
      console.log("An error occurred while retrieving home page content.")
    }
  }

  async learningTasks() {
    await this.retrieveSettings();
    try {
      var tasks = await jsonPOSTRequest("https://"+this.compassURL+"/services/ios.svc/getLearningTasksWithSubmissionItems", {}, this.apiKey);
      return tasks["d"];
    } catch(error) {
      console.log("An error occurred while retrieving learning tasks.")
    }
  }

  async userDetails() {
    await this.retrieveSettings();
    try {
      var userDetail = await jsonPOSTRequest("https://"+this.compassURL+"/services/ios.svc/getuserdetail", {}, this.apiKey);
      return userDetail["d"];
    } catch(error) {
      console.log("An error occurred while retrieving user details.")
    }
  }

  async detailsOfUser(userId) {
    await this.retrieveSettings();
    try {
      var currentUserDetails = await this.userDetails();
      var userDetail = await jsonPOSTRequest("https://"+this.compassURL+"/Services/User.svc/GetUserDetailsBlobByUserId", {targetUserId: userId, userId:currentUserDetails["UserId"]}, this.apiKey);
      return userDetail["d"];
    } catch(error) {
      console.log("An error occurred while retrieving user details.")
    }
  }

  async scheduleForDate(date) {
    await this.retrieveSettings();
    try {
      var userDetails = await this.userDetails();
      var schedule = await jsonPOSTRequest("https://"+this.compassURL+"/services/ios.svc/getuserscheduleforday", {day:date, userId:userDetails["UserId"]}, this.apiKey);
      return schedule["d"];
    } catch(error) {
      console.log("An error occurred while retrieving schedule.")
    }
  }
}

/**
 * Returns an array with the two URLs required to log
 * into Compass: the Compass domain and the school
 * website.
 */
async function getSchoolURLs(schoolName) {
  try {
    for (var i in serverDomains) {
      var response = await jsonPOSTRequest("https://"+serverDomains[i]+schoolDetailsURL, {
        schoolName: schoolName,
      });
      return [ response["d"]["Fqdn"], response["d"]["SchoolId"] ];
    }
  } catch(error) {
    return null;
  }
}

class CompassLogin {
  /**
   * Returns an array of school names.
   */
  async searchSchools(query) {
    for (var i in serverDomains) {
      var response = await jsonPOSTRequest("https://"+serverDomains[i]+schoolNameURL, {
        keyword: query,
      });
      if (response["d"]) {
        return response["d"];
      } else {
        console.log("Domain failed, trying remaining domains...")
      }
    }
  }

  /**
   * Returns an API key from Compass to be associated with
   * all requests.
   */
  async login(schoolName, user, pass) {
    try {
      var schoolNames = await getSchoolURLs(schoolName);
      var compassURL = schoolNames[0];
      var schoolURL = schoolNames[1];
      var response = await jsonPOSTRequest("https://"+compassURL+apiKeyURL, {
        schoolId: schoolURL,
        password: pass,
        sussiId: user,
      });
      if (response["d"]) {
        await AsyncStorage.setItem("@North:compassURL", compassURL);
        await AsyncStorage.setItem("@North:apiKey", response["d"]);
        return response["d"];
      } else {
        console.log("Incorrect username or password for Compass.");
      }
    } catch(error) {
      console.log("Error logging into Compass.");
    }
  }
}

export { CompassLogin, CompassAPI };