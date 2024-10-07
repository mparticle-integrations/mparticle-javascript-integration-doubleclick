var initialization = {
    name: 'DoubleclickDFP',
    moduleId: 41,
    initForwarder: function(settings, testMode, userAttributes, userIdentities, processEvent, eventQueue, isInitialized, common) {
        common.settings = settings;

        if (common.settings.consentMappingWeb) {
            common.consentMappings = parseSettingsString(
                common.settings.consentMappingWeb
            );
        } else {
            // Ensures consent mappings is an empty array
            // for future use
            common.consentMappings = [];
            common.consentPayloadDefaults = {};
            common.consentPayloadAsString = '';
        }

        window.dataLayer = window.dataLayer || [];
        if (!testMode) {
            var url = 'https://www.googletagmanager.com/gtag/js?id=' + settings.advertiserId;

            var gTagScript = document.createElement('script');
            gTagScript.type = 'text/javascript';
            gTagScript.async = true;
            gTagScript.src = url;
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(gTagScript);
            gTagScript.onload = function() {
                isInitialized = true;

                initializeGoogleDFP(common, settings);

                if (eventQueue.length > 0) {
                    // Process any events that may have been queued up while forwarder was being initialized.
                    for (var i = 0; i < eventQueue.length; i++) {
                        processEvent(eventQueue[i]);
                    }
                     // now that each queued event is processed, we empty the eventQueue
                    eventQueue = [];
                }
            };
        } else {
            initializeGoogleDFP(common, settings, isInitialized);
        }

        common.consentPayloadDefaults =
            common.consentHandler.getConsentSettings();
        var defaultConsentPayload = common.cloneObject(
            common.consentPayloadDefaults
        );
        var updatedConsentState = common.consentHandler.getUserConsentState();
        var updatedDefaultConsentPayload =
            common.consentHandler.generateConsentStatePayloadFromMappings(
                updatedConsentState,
                common.consentMappings
            );
    
        if (!common.isEmpty(defaultConsentPayload)) {
            common.sendDefaultConsentPayloadToGoogle(defaultConsentPayload);
        } else if (!common.isEmpty(updatedDefaultConsentPayload)) {
            common.sendDefaultConsentPayloadToGoogle(
                updatedDefaultConsentPayload
            );
        }
    
        common.maybeSendConsentUpdateToGoogle(updatedConsentState);
    },
};

function initializeGoogleDFP(common, settings, isInitialized) {
    common.eventMapping = parseSettingsString(settings.eventMapping);

    common.customVariablesMappings = parseSettingsString(
        settings.customVariables
    ).reduce(function (a, b) {
        a[b.map] = b.value;
        return a;
    }, {});
    common.sendGtag('js', new Date(), true);
    common.sendGtag('allow_custom_scripts', true, true);
    common.sendGtag('config', settings.advertiserId, true);
    isInitialized = true;
}

function parseSettingsString(settingsString) {
    return JSON.parse(settingsString.replace(/&quot;/g, '"'));
}

module.exports = initialization;
