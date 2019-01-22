var common = require('./common');

var initialization = {
    name: 'DoubleclickDFP',
    initForwarder: function(settings, testMode, userAttributes, userIdentities, processEvent, eventQueue, isInitialized) {
        common.settings = settings;
        window.gtag = function() {
            window.dataLayer.push(arguments);
        };

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

                initializeGoogleDFP(settings);

                if (window.gtag && eventQueue.length > 0) {
                    // Process any events that may have been queued up while forwarder was being initialized.
                    for (var i = 0; i < eventQueue.length; i++) {
                        processEvent(eventQueue[i]);
                    }
                     // now that each queued event is processed, we empty the eventQueue
                    eventQueue = [];
                }
            };
        } else {
            isInitialized = true;
            initializeGoogleDFP(settings);
        }
    }
};

function initializeGoogleDFP(settings) {
    common.eventMapping = JSON.parse(settings.eventMapping.replace(/&quot;/g, '\"'));

    common.customVariablesMappings = JSON.parse(settings.customVariables.replace(/&quot;/g, '\"')).reduce(function(a, b) {
        a[b.map] = b.value;
        return a;
    }, {});
    window.gtag('js', new Date());
    window.gtag('allow_custom_scripts', true);
    window.gtag('config', settings.advertiserId);
}

module.exports = initialization;
