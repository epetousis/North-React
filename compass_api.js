"use strict";
import React, { Component } from 'react';
module.exports = class CompassAPI extends Component {
	constructor(props, context) {
    super(props,context);
  	}
	async getApiKey(compassURL, user, pass) {
		try {
			var response = await fetch(compassURL+"/services/admin.svc/getapikey", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					schoolId: "", // we need a separate method to find this
					password: pass,
					sussiId: user,
				})
			});
			var json = await response.text();
			return response.status;
		} catch(error) {
			alert(error);
		}
	}
}

/*class CompassAPI {
	constructor(apiKey) {
		this.apiKey = apiKey;
	}
}*/