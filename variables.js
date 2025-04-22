module.exports = function (self) {
	self.setVariableDefinitions([
		{ variableId: 'restreamer_host', name: 'Hostname' },
		{ variableId: 'username', name: 'Username' },
		{ variableId: 'password', name: 'Password' },
		{ variableId: 'stream_sources', name: 'Array of stream sources' },
	])
}
