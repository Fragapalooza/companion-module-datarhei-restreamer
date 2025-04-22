module.exports = function (self) {
	self.setVariableDefinitions([
		{ name: `channel_${channelId}_viewers`, valueFunc() { return getChannelViewers(channelId); } },
		{ name: `channel_${channelId}_runtime`, valueFunc() { return getChannelRuntime(channelId); } },
		{ name: `channel_${channelId}_egress_endpoints`, valueFunc() { return getEgressEndpoints(channelId); } },
		{ variableId: 'restreamer_host', name: 'Hostname' },
		{ variableId: 'username', name: 'Username' },
		{ variableId: 'password', name: 'Password' },
		{ variableId: 'stream_sources', name: 'Array of stream sources' },
	])
}
