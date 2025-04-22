const { combineRgb, CompanionFeedbackAdvancedEvent, CompanionFeedbackBooleanEvent } = require('@companion-module/base')

module.exports = async function (self) {
	self.setFeedbackDefinitions({
		ChannelState: {
			type: 'advanced',
			label: 'Stream State Feedback',
			description: 'Provide feedback on stream state (active/inactive/listening/connected)',
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
					{ id: 'active', label: 'Active' },
					{ id: 'inactive', label: 'Inactive' },
					{ id: 'listening', label: 'Listening' },
					{ id: 'connected', label: 'Connected' },
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
