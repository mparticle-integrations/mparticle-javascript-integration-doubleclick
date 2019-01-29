var common = require('./common');

var eventCounterTypes = {
    standard: 1,
    unique: 1,
    per_session: 1
};

var eventHandler = {
    logEvent: function(event) {
        var gtagProperties = {};
        common.setCustomVariables(event, gtagProperties);
        var eventMapping = common.getEventMapping(event);

        if (!eventMapping) {
            console.log('Event not mapped. Event not sent.');
            return false;
        }

        if (eventMapping.result && eventMapping.match) {
            var counter = event.CustomFlags && event.CustomFlags['DoubleClick.Counter'] ? event.CustomFlags['DoubleClick.Counter'] : null;
            if (!counter) {
                console.log('Event not sent. Event conversions requires a custom flag of DoubleClick.Counter equal to \'standard\', \'unique\, or \'per_session\'. See https://support.google.com/dcm/partner/answer/2823400?hl=en for more info')
                return false;
            }
            if (eventCounterTypes[counter]) {
                common.setSendTo(eventMapping.match, event.CustomFlags, gtagProperties);
                gtagProperties.send_to += ('+' + counter);
                common.sendGtag('conversion', gtagProperties);
            } else {
                console.log('Counter type not valid. For event conversions, use \'standard\', \'unique\, or \'per_session\'. See https://support.google.com/dcm/partner/answer/2823400?hl=en for more info')
                return false;
            }
        }
        return true;
    },
    logError: function() {
    },
    logPageView: function() {
    }
};

module.exports = eventHandler;
