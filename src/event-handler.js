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
        if (eventMapping && eventMapping.result && eventMapping.match) {
            if (event.CustomFlags && event.CustomFlags['DoubleClick.Counter']) {
                if (eventCounterTypes[event.CustomFlags['DoubleClick.Counter']]) {
                    common.setSendTo(eventMapping.match, event.CustomFlags, gtagProperties);
                    gtagProperties.send_to += ('+' + event.CustomFlags['DoubleClick.Counter']);
                    common.sendGtag('conversion', gtagProperties);
                } else {
                    console.log('Counter type not valid. For event conversions, use \'standard\', \'unique\, or \'per_session\'. See https://support.google.com/dcm/partner/answer/2823400?hl=en for more info')
                }
            } else {
                console.log('event not sent, no counter set. Please set a customFlag of DoubleClick.Counter');
                return false;
            }
        } else {
            console.log('Event not mapped. Event not sent.');
            return false;
        }
    },
    logError: function() {
    },
    logPageView: function() {
    }
};

module.exports = eventHandler;
