
const { InstanceBase, Regex, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const UpgradeScripts = require('./upgrades')
const UpdateActions = require('./actions')
const UpdateFeedbacks = require('./feedbacks')
const UpdateVariableDefinitions = require('./variables');
const axios = require('axios');
const jwt = require('jsonwebtoken');


class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config

		this.updateStatus(InstanceStatus.Ok, "Begin initialization")

		this.updateActions() // export actions
		this.updateFeedbacks() // export feedbacks
		this.updateVariableDefinitions() // export variable definitions
		this.access_token = null
		this.refresh_token = null


		if(this.config.host && this.config.username && this.config.password) {
			this.config.uri_base = '' + this.config.host + ''
			this.log('debug', 'Attempt login')
			this.updateStatus(InstanceStatus.Connecting, 'Connecting to ' + this.config.host)
			await this.login()
			if(this.access_token) {
				this.log('debug', 'Login successful, getting channel list')
				await this.ensureValidToken();
				await this.getChannelList()
				.then(channels => {
					console.log('Fetched channels:', channels);
					this.updateStatus(InstanceStatus.Ok, 'Fetched channels');
					this.channelList = channels
				})
				.catch(error => {
					this.log('error', 'Error fetching channels: ' + error.message);
					this.updateStatus(InstanceStatus.ConnectionFailure, 'Error fetching channels');
				});
				console.log('debug', 'Channel list:', this.channelList);
				if(this.channelList.length > 0) {
					this.log('debug', 'Channel list is not empty')
					this.setVariableDefinitions(this.channelList)
				}
			}
		}
	}
	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
	}

	async configUpdated(config) {
		this.config = config
	}

	// Get the list of channels
	async getChannelList() {
		this.updateStatus('connecting', 'Fetching channel list');
		try {
			// Fetch the list of files from the API
			this.log('debug', 'Fetching channel list from ' + this.config.uri_base + '/api/v3/fs/disk?sort=name&order=asc')
			this.log('debug', 'access_token is ' + this.access_token)
			const response = await axios.get(`${this.config.uri_base}/api/v3/fs/disk?sort=name&order=asc`,{
				headers: {
					'Authorization': `Bearer ${this.access_token}`
				}
			})
			.then(response => {
				console.log('debug', 'Response content-type:', response.headers['content-type'])
				console.log('debug', 'Response status:', response.status)
//				console.log('debug', 'Response data:', response.data)
				console.log('debug', 'Response statusText:', response.statusText)
//				const files = response.data; // Adjust this if your data structure is different[2][3].
//				console.log('debug', 'Fetched files:', files);
				return response;
			}) 
			const files = response.data; // Adjust this if your data structure is different[2][3].
			const regex = /^\/([a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12})\.html$/; // Adjust the regex as needed
		
			// Filter and initialize array of objects
			const matchedFiles = files
			.filter(file => {
//				const name = regex.test(file.name);
				const matched = file.name.match(regex)
				if(matched) { 
//					console.log('debug', 'File name:', file.name, 'Matches regex:', matched[1])
					return true;
				} else {
//					console.log('debug', 'File name:', file.name, 'Does not match regex:')
					return false;
				}
			});
			matchedFiles.forEach(file => {
				file.name = file.name.replace(/^\//, ''); // Remove the .html extension
				file.name = file.name.replace(/\.html$/, ''); // Remove the .html extension
			})
			const actualFiles = matchedFiles.map(file => file.name);
		
			return actualFiles; // Return the array of filenames
		} catch (error) {
			console.error('Error fetching files:', error.response ? error.response.data : error.message);
			return [];
		}
	}

	// Function to ensure the token is valid
	async ensureValidToken() {
		this.updateStatus('connecting', 'Checking token validity');
		console.log('debug', 'Checking token validity')
		// 1. Check if access token is valid
		if (!this.isTokenExpired(this.access_token)) {
		  return;
		}
	  
		// 2. Try to refresh the token
		try {
			console.log('debug', 'Trying to refresh token')
			const response = await axios.post(`${this.config.uri_base}/api/login/refresh`, { 
			headers: {
				'Authorization': `Bearer ${this.refresh_token}`
			}
			});
		 	console.log('debug', 'Token refreshed successfully')

		  	const newAccessToken = response.data.access_token;
		  	// Optionally, update your stored tokens here
		  	return this.access_token = newAccessToken;
		} catch (err) {
			console.log('debug', 'Token refresh failed, logging in again')

			// 3. If refresh fails, login again
			return await login();
		}
	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This will connect with the datarhei restreamer',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target Host (http:// or https:// and :port if needed)',
				width: 12,
				useVariables: true,
			},
			{
				type: 'textinput',
				id: 'username',
				label: 'Username',
				value: 'admin',
				width: 6,
				useVariables: true,
			},
			{
				type: 'textinput',
				id: 'password',
				label: 'Password',
				width: 6,
				useVariables: true,
			}
		]
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	updateVariableDefinitions() {
		UpdateVariableDefinitions(this)
	}

	async login() {
		this.updateStatus('connecting', 'Logging in');

		const response = await axios.post(`${this.config.uri_base}/api/login`, {
			username: this.config.username,
			password: this.config.password
		})
		.catch(e => {
			this.log('debug', `Could not connect to ${this.config.host}: ${e.message}`);
			this.updateStatus('connection_failure', e.message)
			return false
		})
		if (response.status === 200) {
			this.access_token = response.data.access_token;
			this.refresh_token = response.data.refresh_token;
			this.updateStatus(InstanceStatus.Ok, 'Connected to ' + this.config.host); // Update the status to OK
			this.log('info', 'Successfully connected. access_token is ' + this.access_token + '.' + ' refresh_token is ' + this.refresh_token + '.');
			return true;
		} else {
			this.updateStatus(InstanceStatus.AuthenticationFailure); // Update the status to AuthenticationFailure
			console.error('Login failed');
			return false;
		}
	}

	async login_refresh() {
		this.updateStatus('connecting', 'Logging in');

		const response = await axios.post(`${this.config.uri_base}/api/login/refresh`, {
			username: this.config.username,
			password: this.config.password
		})
		.catch(e => {
			this.log('debug', `Could not connect to ${this.config.host}: ${e.message}`);
			this.updateStatus('connection_failure', e.message)
			return false
		})
		if (response.status === 200) {
			this.access_token = response.data.access_token;
			this.refresh_token = response.data.refresh_token;
			this.updateStatus(InstanceStatus.Ok); // Update the status to OK
			this.log('info', 'Successfully connected. access_token is ' + this.access_token + '.' + ' refresh_token is ' + this.refresh_token + '.');

			this.updateStatus('ok', 'Connected to ' + this.config.host);
			return true;
		} else {
			this.updateStatus(InstanceStatus.AuthenticationFailure); // Update the status to AuthenticationFailure
			console.error('Login failed');
			return false;
		}
	}

	// Helper: Check if the token is expired
	isTokenExpired(token) {
		try {
			const decoded = jwt.decode(token);
			if (!decoded || !decoded.exp) return true;
			// exp is in seconds, Date.now() is ms
			return Date.now() >= decoded.exp * 1000;
		} catch (e) {
			return true;
		}
	}


	// Function to get or update the "Channel" object
	// This function will create and load a channel object for the given channel ID
	// the "reference" is the channel ID, I don't really know what's involved in this process
	// the api call /api/v3/process?reference=REFERENCE_ID is used to get the channel objects

	// id: restreamer-ui:ingest is a channel input method
	// state.order value of "start" means the channel source is listening
	// state.order value of "stop" means the channel source is *NOT* listening
	// state.exec value of "running" means the channel source is connected
	// state.exec value of "failed" means the channel source is not connected (possibly due to no source)
	// state.exec value of "finished" means the channel source is not connected (and not trying to), should only be possible when state.order is "stopped"
	// metadata.restreamer-ui.meta.name is the channel name

	// id: restreamer-ui:egress is a publication method
	// state.order value of "start" means the publication is toggled on
	// state.order value of "stop" means the publication is toggled off
	// state.exec value of "running" means the publication is connected
	// state.exec value of "failed" means the publication is not connected (possibly due to no source)
	// state.exec value of "finished" means the publication is not connected (and not trying to), should only be possible when state.order is "stopped"
	// metadata.restreamer-ui.name is the publication destination name
	
	// Function 


	// Function to fetch session information
	async fetchSessionInfo() {
		this.updateStatus('connecting', 'Fetching session information');

		// Perhaps wrap this get process with a means that handles token expiration properly and if no good, refresh
		const response = await axios.get(`${this.config.uri_base}/api/session`, {
			headers: {
				'Authorization': `Bearer ${this.access_token}`
			}
		})
		.catch(e => {
			this.log('debug', `Could not connect to ${this.config.host}: ${e.message}`);
			this.updateStatus('connection_failure', e.message)
			return false
		})
		if (response.status === 200) {
			this.updateStatus(InstanceStatus.Ok, 'Response was 200'); // Update the status to OK
			this.log('info', 'Successfully fetched session information.');
			return response.data;
		} else {
			this.updateStatus(InstanceStatus.AuthenticationFailure); // Update the status to AuthenticationFailure
			console.error('Failed to fetch session information');
			return false;
		}
	}


/*	
	async login(host, username, password) {
		try {
		  const response = await ky.post(`https://${host}/api/login`, {
			json: {
				username: username,
				password: password,
			},
		  }).json;
	  
		} catch (error) {
		  console.error('Error during login:', error.message);
		  return false;
		}
	  }
*/
	// This function will be called when the module is reloaded
	async reload() {
		this.log('debug', 'reload')
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
	}

	// This function will be called when the module is reloaded
	async updateConfig(config) {
		this.log('debug', 'updateConfig')
		this.config = config
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableDefinitions()
	}

	// This function will be called when the module is reloaded
	async updateVariables() {
		this.log('debug', 'updateVariables')
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
