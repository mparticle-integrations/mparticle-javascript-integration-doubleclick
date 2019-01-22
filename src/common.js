module.exports = {
    eventMapping: {},
    customVariablesMappings: {},
    settings: {},
    setCustomVariables: function(event, gtagProperties) {
        for (var attribute in event.EventAttributes) {
            if (this.customVariablesMappings[attribute]) {
                gtagProperties[this.customVariablesMappings[attribute]] = event.EventAttributes[attribute];
            }
        }
    },
    setSendTo: function(mapping, customFlags, gtagProperties) {
        var tags = mapping.value.split(';');
        var groupTag = tags[0];
        var activityTag = tags[1];
        gtagProperties.send_to = 'DC-' + this.settings.advertiserId + '/' + groupTag + '/' + activityTag;
    },
    getEventMapping: function (event) {
        var jsHash = calculateJSHash(event.EventDataType, event.EventCategory, event.EventName);
        return findValueInMapping(jsHash, this.eventMapping);
    },
    sendGtag: function(type, properties) {
        window.gtag('event', type, properties);
    }
};

function findValueInMapping(jsHash, mapping) {
    if (mapping) {
        var filteredArray = mapping.filter(function(mappingEntry) {
            if (mappingEntry.jsmap && mappingEntry.maptype && mappingEntry.value) {
                return mappingEntry.jsmap === jsHash.toString();
            }

            return {
                result: false
            };
        });

        if (filteredArray && filteredArray.length > 0) {
            return {
                result: true,
                match: filteredArray[0]
            };
        }
    }
    return null;
}

function calculateJSHash(eventDataType, eventCategory, name) {
    var preHash =
        ('' + eventDataType) +
        ('' + eventCategory) + '' +
        (name || '');

    return mParticle.generateHash(preHash);
}
