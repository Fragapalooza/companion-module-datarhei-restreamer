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
		// Add a publication stream
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
		// Remove a publication stream
		remove_egress_stream: {
			label: 'Remove Egress Stream',
			options: [
			  {
				id: 'stream_id',
				type: 'textinput',
				label: 'Stream ID',
			  },
			],
			callback: (action) => {
			  // Use Restreamer API to remove egress stream
			  removeEgressStream(selectedChannel, action.options.stream_id);
			},
		},
		// Toggle a publication stream
		toggle_egress_stream: {
			label: 'Toggle Egress Stream',
			options: [
			  {
				id: 'stream_id',
				type: 'textinput',
				label: 'Stream ID',
			  },
			],
			callback: (action) => {
			  // Use Restreamer API to toggle egress stream
			  toggleEgressStream(selectedChannel, action.options.stream_id);
			},
		},
		// Toggle an ingestion (channel source) stream
		toggle_ingress_stream: {
			label: 'Toggle Ingress Stream',
			options: [
			  {
				id: 'stream_id',
				type: 'textinput',
				label: 'Stream ID',
			  },
			],
			callback: (action) => {
			  // Use Restreamer API to toggle ingress stream
			  toggleIngressStream(selectedChannel, action.options.stream_id);
			},
		},
		  
	})
}
