const { combineRgb, CompanionFeedbackAdvancedEvent, CompanionFeedbackBooleanEvent } = require('@companion-module/base')

module.exports = async function (self) {
	self.setFeedbackDefinitions({
		// Feedback for channel state
		// Essentially we're going to read the "state.order" field on the ingress stream being start or stop
		// Then we're going to read the "state.exec" field on the ingress stream being "running", "failed", "finished"
		ChannelState: {
			type: 'advanced',
			label: 'Stream State Feedback',
			description: 'Provide feedback on stream state (active/inactive/listening)',
			options: [
				{
					id: 'stream_id',
					type: 'textinput',
					label: 'Stream ID',
				},
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					choices: [
					{ id: 'active', label: 'Active' },		// start, and running
					{ id: 'inactive', label: 'Inactive' },	// stop, and finished
					{ id: 'listening', label: 'Listening' },// start, and failed
					],
				},
			],
			callback: (feedback) => {
				// Fetch stream state from Restreamer API
				return fetchStreamState(feedback.options.stream_id) === feedback.options.state;
			},
		},
		PublicationState: {
			type: 'advanced',
			label: 'Stream State Feedback',
			description: 'Provide feedback on stream state (active/inactive/listening)',
			options: [
				{
					id: 'stream_id',
					type: 'textinput',
					label: 'Stream ID',
				},
				{
					id: 'state',
					type: 'dropdown',
					label: 'State',
					choices: [
						{ id: 'active', label: 'Active' },			// start, and running
						{ id: 'inactive', label: 'Inactive' },		// stop, and finished
						{ id: 'connecting', label: 'Connecting' },	// start, and failed
						],
				},
			],
			callback: (feedback) => {
				// Fetch stream state from Restreamer API
				return fetchStreamState(feedback.options.stream_id) === feedback.options.state;
			},
		},
	})
}
