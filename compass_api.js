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

class CompassAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async homeContent() {
    // to do
  }
}

/**
 * Send a JSON request, get a JSON response. Simple.
 */
async function jsonPOSTRequest(URL, body) {
  try {
    var response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body)
    });
    var jsonResponse = await response.json();
    return jsonResponse;
  } catch(error) {
    return {};
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