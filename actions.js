module.exports = function (self) {
	self.setActionDefinitions({
		select_channel: {
			label: 'Select Channel',
			options: [
			  {
				id: 'channel_id',
				type: 'textinput',
				label: 'Channel ID',
			  },
			],
			callback: (action) => {
			  selectedChannel = action.options.channel_id;
			  // Save selected channel in memory or state.
			},
		  },
		  add_egress_stream: {
			label: 'Add Egress Stream',
			options: [
			  {
				id: 'url',
				type: 'textinput',
				label: 'Egress URL',
			  },
			  {
				id: 'protocol',
				type: 'dropdown',
				label: 'Protocol',
				choices: [
				  { id: 'rtmp', label: 'RTMP' },
				  { id: 'hls', label: 'HLS' },
				],
			  },
			],
			callback: (action) => {
			  // Use Restreamer API to add egress stream
			  addEgressStream(selectedChannel, action.options.url, action.options.protocol);
			},
		  },
	})
}
