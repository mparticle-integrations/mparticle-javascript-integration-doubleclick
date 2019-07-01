var mpDoubleClickKit = (function (exports) {
    'use strict';

    function Common() {}

    Common.prototype.eventMapping = {};
    Common.prototype.customVariablesMappings = {};
    Common.prototype.settings = {};
    Common.prototype.setCustomVariables = function(event, gtagProperties) {
        for (var attribute in event.EventAttributes) {
            if (this.customVariablesMappings[attribute]) {
                gtagProperties[this.customVariablesMappings[attribute]] =
                    event.EventAttributes[attribute];
            }
        }
    };
    Common.prototype.setSendTo = function(mapping, customFlags, gtagProperties) {
        var tags = mapping.value.split(';');
        var groupTag = tags[0];
        var activityTag = tags[1];
        gtagProperties.send_to =
            'DC-' + this.settings.advertiserId + '/' + groupTag + '/' + activityTag;
    };
    Common.prototype.getEventMapping = function(event) {
        var jsHash = calculateJSHash(
            event.EventDataType,
            event.EventCategory,
            event.EventName
        );
        return findValueInMapping(jsHash, this.eventMapping);
    };
    Common.prototype.sendGtag = function(type, properties, isInitialization) {
        function gtag() {
            window.dataLayer.push(arguments);
        }
        if (Array.isArray(window.dataLayer)) {
            if (isInitialization) {
                gtag(type, properties);
            } else {
                gtag('event', type, properties);
            }
        }
    };

    var common = Common;

    function findValueInMapping(jsHash, mapping) {
        if (mapping) {
            var filteredArray = mapping.filter(function(mappingEntry) {
                if (
                    mappingEntry.jsmap &&
                    mappingEntry.maptype &&
                    mappingEntry.value
                ) {
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
        var preHash = '' + eventDataType + ('' + eventCategory) + '' + (name || '');

        return mParticle.generateHash(preHash);
    }

    var salesCounterTypes = {
        transactions: 1,
        items_sold: 1
    };
    var ITEMS_SOLD = 'items_sold';

    function CommerceHandler(common) {
        this.common = common || {};
    }

    CommerceHandler.prototype.logCommerceEvent = function(event) {
        if (event.EventDataType === mParticle.CommerceEventType.ProductPurchase) {
            var counter =
                event.CustomFlags && event.CustomFlags['DoubleClick.Counter']
                    ? event.CustomFlags['DoubleClick.Counter']
                    : null;
            if (!counter) {
                console.log(
                    "Event not sent. Sales conversions requires a custom flag of DoubleClick.Counter equal to 'transactions', or 'items_sold'. See https://support.google.com/dcm/partner/answer/2823400?hl=en for more info"
                );
                return false;
            } else if (!salesCounterTypes[counter]) {
                console.log(
                    "Counter type not valid. For sales conversions, use a custom flag of DoubleClick.Counter equal to 'transactions', or 'items_sold'. See https://support.google.com/dcm/partner/answer/2823400?hl=en for more info"
                );
                return false;
            }

            var eventMapping = this.common.getEventMapping(event);

            if (!eventMapping) {
                console.log('Event not mapped. Event not sent.');
                return false;
            }

            if (eventMapping.result && eventMapping.match) {
                var gtagProperties = {};
                this.common.setCustomVariables(event, gtagProperties);
                this.common.setSendTo(
                    eventMapping.match,
                    event.CustomFlags,
                    gtagProperties
                );
                gtagProperties.send_to += '+' + counter;
                //stringify number
                gtagProperties.value = '' + event.ProductAction.TotalAmount;
                gtagProperties.transaction_id = event.ProductAction.TransactionId;

                if (counter === ITEMS_SOLD) {
                    gtagProperties.quantity =
                        '' + event.ProductAction.ProductList.length;
                }
                this.common.sendGtag('purchase', gtagProperties);
                return true;
            }
        }
    };

    var commerceHandler = CommerceHandler;

    var eventCounterTypes = {
        standard: 1,
        unique: 1,
        per_session: 1
    };

    function EventHandler(common) {
        this.common = common || {};
    }

    EventHandler.prototype.logEvent = function(event) {
        var gtagProperties = {};
        this.common.setCustomVariables(event, gtagProperties);
        var eventMapping = this.common.getEventMapping(event);

        if (!eventMapping) {
            console.log('Event not mapped. Event not sent.');
            return false;
        }

        if (eventMapping.result && eventMapping.match) {
            var counter =
                event.CustomFlags && event.CustomFlags['DoubleClick.Counter']
                    ? event.CustomFlags['DoubleClick.Counter']
                    : null;
            if (!counter) {
                console.log(
                    "Event not sent. Event conversions requires a custom flag of DoubleClick.Counter equal to 'standard', 'unique, or 'per_session'. See https://support.google.com/dcm/partner/answer/2823400?hl=en for more info"
                );
                return false;
            }
            if (eventCounterTypes[counter]) {
                this.common.setSendTo(
                    eventMapping.match,
                    event.CustomFlags,
                    gtagProperties
                );
                gtagProperties.send_to += '+' + counter;
                this.common.sendGtag('conversion', gtagProperties);
            } else {
                console.log(
                    "Counter type not valid. For event conversions, use 'standard', 'unique, or 'per_session'. See https://support.google.com/dcm/partner/answer/2823400?hl=en for more info"
                );
                return false;
            }
        }
        return true;
    };
    EventHandler.prototype.logError = function() {};
    EventHandler.prototype.logPageView = function() {};

    var eventHandler = EventHandler;

    /*
    The 'mParticleUser' is an object with methods get user Identities and set/get user attributes
    Partners can determine what userIds are available to use in their SDK
    Call mParticleUser.getUserIdentities() to return an object of userIdentities --> { userIdentities: {customerid: '1234', email: 'email@gmail.com'} }
    For more identity types, see http://docs.mparticle.com/developers/sdk/javascript/identity#allowed-identity-types
    Call mParticleUser.getMPID() to get mParticle ID
    For any additional methods, see http://docs.mparticle.com/developers/sdk/javascript/apidocs/classes/mParticle.Identity.getCurrentUser().html
    */

    /*
    identityApiRequest has the schema:
    {
      userIdentities: {
        customerid: '123',
        email: 'abc'
      }
    }
    For more userIdentity types, see http://docs.mparticle.com/developers/sdk/javascript/identity#allowed-identity-types
    */

    function IdentityHandler(common) {
        this.common = common || {};
    }

    IdentityHandler.prototype.onUserIdentified = function(mParticleUser) {};
    IdentityHandler.prototype.onIdentifyComplete = function(
        mParticleUser,
        identityApiRequest
    ) {};
    IdentityHandler.prototype.onLoginComplete = function(
        mParticleUser,
        identityApiRequest
    ) {};
    IdentityHandler.prototype.onLogoutComplete = function(
        mParticleUser,
        identityApiRequest
    ) {};
    IdentityHandler.prototype.onModifyComplete = function(
        mParticleUser,
        identityApiRequest
    ) {};

    /*  In previous versions of the mParticle web SDK, setting user identities on
        kits is only reachable via the onSetUserIdentity method below. We recommend
        filling out `onSetUserIdentity` for maximum compatibility
    */
    IdentityHandler.prototype.onSetUserIdentity = function(
        forwarderSettings,
        id,
        type
    ) {};

    var identityHandler = IdentityHandler;

    var initialization = {
        name: 'DoubleclickDFP',
        moduleId: 41,
        initForwarder: function(settings, testMode, userAttributes, userIdentities, processEvent, eventQueue, isInitialized, common) {
            common.settings = settings;

            window.dataLayer = window.dataLayer || [];
            if (!testMode) {
                var url = 'https://www.googletagmanager.com/gtag/js?id=' + settings.advertiserId;

                var gTagScript = document.createElement('script');
                gTagScript.type = 'text/javascript';
                gTagScript.async = true;
                gTagScript.src = url;
                (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(gTagScript);
                gTagScript.onload = function() {

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
                initializeGoogleDFP(common, settings);
            }
        }
    };

    function initializeGoogleDFP(common, settings, isInitialized) {
        common.eventMapping = JSON.parse(settings.eventMapping.replace(/&quot;/g, '\"'));

        common.customVariablesMappings = JSON.parse(settings.customVariables.replace(/&quot;/g, '\"')).reduce(function(a, b) {
            a[b.map] = b.value;
            return a;
        }, {});
        common.sendGtag('js', new Date(), true);
        common.sendGtag('allow_custom_scripts', true, true);
        common.sendGtag('config', settings.advertiserId, true);
    }

    var initialization_1 = initialization;

    var sessionHandler = {
        onSessionStart: function(event) {
            
        },
        onSessionEnd: function(event) {

        }
    };

    var sessionHandler_1 = sessionHandler;

    /*
    The 'mParticleUser' is an object with methods on it to get user Identities and set/get user attributes
    Partners can determine what userIds are available to use in their SDK
    Call mParticleUser.getUserIdentities() to return an object of userIdentities --> { userIdentities: {customerid: '1234', email: 'email@gmail.com'} }
    For more identity types, see http://docs.mparticle.com/developers/sdk/javascript/identity#allowed-identity-types
    Call mParticleUser.getMPID() to get mParticle ID
    For any additional methods, see http://docs.mparticle.com/developers/sdk/javascript/apidocs/classes/mParticle.Identity.getCurrentUser().html
    */

    function UserAttributeHandler(common) {
        this.common = common = {};
    }

    UserAttributeHandler.prototype.onRemoveUserAttribute = function(
        key,
        mParticleUser
    ) {};
    UserAttributeHandler.prototype.onSetUserAttribute = function(
        key,
        value,
        mParticleUser
    ) {};
    UserAttributeHandler.prototype.onConsentStateUpdated = function(
        oldState,
        newState,
        mParticleUser
    ) {};

    var userAttributeHandler = UserAttributeHandler;

    /*!
     * isobject <https://github.com/jonschlinkert/isobject>
     *
     * Copyright (c) 2014-2017, Jon Schlinkert.
     * Released under the MIT License.
     */

    function isObject(val) {
      return val != null && typeof val === 'object' && Array.isArray(val) === false;
    }

    // =============== REACH OUT TO MPARTICLE IF YOU HAVE ANY QUESTIONS ===============
    //
    //  Copyright 2018 mParticle, Inc.
    //
    //  Licensed under the Apache License, Version 2.0 (the "License");
    //  you may not use this file except in compliance with the License.
    //  You may obtain a copy of the License at
    //
    //      http://www.apache.org/licenses/LICENSE-2.0
    //
    //  Unless required by applicable law or agreed to in writing, software
    //  distributed under the License is distributed on an "AS IS" BASIS,
    //  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    //  See the License for the specific language governing permissions and
    //  limitations under the License.









        

        var name = initialization_1.name,
            moduleId = initialization_1.moduleId,
            MessageType = {
                SessionStart: 1,
                SessionEnd: 2,
                PageView: 3,
                PageEvent: 4,
                CrashReport: 5,
                OptOut: 6,
                Commerce: 16
            };

        var constructor = function () {
            var self = this,
                isInitialized = false,
                forwarderSettings,
                reportingService,
                eventQueue = [];

            self.name = initialization_1.name;
            self.moduleId = initialization_1.moduleId;
            self.common = new common();

            function initForwarder(settings, service, testMode, trackerId, userAttributes, userIdentities) {
                forwarderSettings = settings;

                if (window.mParticle.isTestEnvironment) {
                    reportingService = function() {
                    };
                } else {
                    reportingService = service;
                }

                try {
                    initialization_1.initForwarder(settings, testMode, userAttributes, userIdentities, processEvent, eventQueue, isInitialized, self.common);
                    self.eventHandler = new eventHandler(self.common);
                    self.identityHandler = new identityHandler(self.common);
                    self.userAttributeHandler = new userAttributeHandler(self.common);
                    self.commerceHandler = new commerceHandler(self.common);

                    isInitialized = true;
                } catch (e) {
                    console.log('Failed to initialize ' + name + ' - ' + e);
                }
            }

            function processEvent(event) {
                var reportEvent = false;
                if (isInitialized) {
                    try {
                        if (event.EventDataType === MessageType.SessionStart) {
                            reportEvent = logSessionStart(event);
                        } else if (event.EventDataType === MessageType.SessionEnd) {
                            reportEvent = logSessionEnd(event);
                        } else if (event.EventDataType === MessageType.CrashReport) {
                            reportEvent = logError(event);
                        } else if (event.EventDataType === MessageType.PageView) {
                            reportEvent = logPageView(event);
                        }
                        else if (event.EventDataType === MessageType.Commerce) {
                            reportEvent = logEcommerceEvent(event);
                        }
                        else if (event.EventDataType === MessageType.PageEvent) {
                            reportEvent = logEvent(event);
                        }
                        if (reportEvent === true && reportingService) {
                            reportingService(self, event);
                            return 'Successfully sent to ' + name;
                        }
                        else {
                            return 'Error logging event or event type not supported on forwarder ' + name;
                        }
                    }
                    catch (e) {
                        return 'Failed to send to ' + name + ' ' + e;
                    }
                } else {
                    eventQueue.push(event);
                    return 'Can\'t send to forwarder ' + name + ', not initialized. Event added to queue.';
                }
            }

            function logSessionStart(event) {
                try {
                    sessionHandler_1.onSessionStart(event);
                    return true;
                } catch (e) {
                    return {error: 'Error starting session on forwarder ' + name + '; ' + e};
                }
            }

            function logSessionEnd(event) {
                try {
                    sessionHandler_1.onSessionEnd(event);
                    return true;
                } catch (e) {
                    return {error: 'Error ending session on forwarder ' + name + '; ' + e};
                }
            }

            function logError(event) {
                try {
                    self.eventHandler.logError(event);
                    return true;
                } catch (e) {
                    return {error: 'Error logging error on forwarder ' + name + '; ' + e};
                }
            }

            function logPageView(event) {
                try {
                    self.eventHandler.logPageView(event);
                    return true;
                } catch (e) {
                    return {error: 'Error logging page view on forwarder ' + name + '; ' + e};
                }
            }

            function logEvent(event) {
                try {
                    self.eventHandler.logEvent(event);
                    return true;
                } catch (e) {
                    return {error: 'Error logging event on forwarder ' + name + '; ' + e};
                }
            }

            function logEcommerceEvent(event) {
                try {
                    self.commerceHandler.logCommerceEvent(event);
                    return true;
                } catch (e) {
                    return {error: 'Error logging purchase event on forwarder ' + name + '; ' + e};
                }
            }

            function setUserAttribute(key, value) {
                if (isInitialized) {
                    try {
                        self.userAttributeHandler.onSetUserAttribute(key, value, forwarderSettings);
                        return 'Successfully set user attribute on forwarder ' + name;
                    } catch (e) {
                        return 'Error setting user attribute on forwarder ' + name + '; ' + e;
                    }
                } else {
                    return 'Can\'t set user attribute on forwarder ' + name + ', not initialized';
                }
            }

            function removeUserAttribute(key) {
                if (isInitialized) {
                    try {
                        self.userAttributeHandler.onRemoveUserAttribute(key, forwarderSettings);
                        return 'Successfully removed user attribute on forwarder ' + name;
                    } catch (e) {
                        return 'Error removing user attribute on forwarder ' + name + '; ' + e;
                    }
                } else {
                    return 'Can\'t remove user attribute on forwarder ' + name + ', not initialized';
                }
            }

            function setUserIdentity(id, type) {
                if (isInitialized) {
                    try {
                        self.identityHandler.onSetUserIdentity(forwarderSettings, id, type);
                        return 'Successfully set user Identity on forwarder ' + name;
                    } catch (e) {
                        return 'Error removing user attribute on forwarder ' + name + '; ' + e;
                    }
                } else {
                    return 'Can\'t call setUserIdentity on forwarder ' + name + ', not initialized';
                }

            }

            function onUserIdentified(user) {
                if (isInitialized) {
                    try {
                        self.identityHandler.onUserIdentified(user);

                        return 'Successfully called onUserIdentified on forwarder ' + name;
                    } catch (e) {
                        return {error: 'Error calling onUserIdentified on forwarder ' + name + '; ' + e};
                    }
                }
                else {
                    return 'Can\'t set new user identities on forwader  ' + name + ', not initialized';
                }
            }

            function onIdentifyComplete(user, filteredIdentityRequest) {
                if (isInitialized) {
                    try {
                        self.identityHandler.onIdentifyComplete(user, filteredIdentityRequest);

                        return 'Successfully called onIdentifyComplete on forwarder ' + name;
                    } catch (e) {
                        return {error: 'Error calling onIdentifyComplete on forwarder ' + name + '; ' + e};
                    }
                }
                else {
                    return 'Can\'t call onIdentifyCompleted on forwader  ' + name + ', not initialized';
                }
            }

            function onLoginComplete(user, filteredIdentityRequest) {
                if (isInitialized) {
                    try {
                        self.identityHandler.onLoginComplete(user, filteredIdentityRequest);

                        return 'Successfully called onLoginComplete on forwarder ' + name;
                    } catch (e) {
                        return {error: 'Error calling onLoginComplete on forwarder ' + name + '; ' + e};
                    }
                }
                else {
                    return 'Can\'t call onLoginComplete on forwader  ' + name + ', not initialized';
                }
            }

            function onLogoutComplete(user, filteredIdentityRequest) {
                if (isInitialized) {
                    try {
                        self.identityHandler.onLogoutComplete(user, filteredIdentityRequest);

                        return 'Successfully called onLogoutComplete on forwarder ' + name;
                    } catch (e) {
                        return {error: 'Error calling onLogoutComplete on forwarder ' + name + '; ' + e};
                    }
                }
                else {
                    return 'Can\'t call onLogoutComplete on forwader  ' + name + ', not initialized';
                }
            }

            function onModifyComplete(user, filteredIdentityRequest) {
                if (isInitialized) {
                    try {
                        self.identityHandler.onModifyComplete(user, filteredIdentityRequest);

                        return 'Successfully called onModifyComplete on forwarder ' + name;
                    } catch (e) {
                        return {error: 'Error calling onModifyComplete on forwarder ' + name + '; ' + e};
                    }
                }
                else {
                    return 'Can\'t call onModifyComplete on forwader  ' + name + ', not initialized';
                }
            }

            function setOptOut(isOptingOutBoolean) {
                if (isInitialized) {
                    try {
                        self.initialization.setOptOut(isOptingOutBoolean);

                        return 'Successfully called setOptOut on forwarder ' + name;
                    } catch (e) {
                        return {error: 'Error calling setOptOut on forwarder ' + name + '; ' + e};
                    }
                }
                else {
                    return 'Can\'t call setOptOut on forwader  ' + name + ', not initialized';
                }
            }

            this.init = initForwarder;
            this.process = processEvent;
            this.setUserAttribute = setUserAttribute;
            this.removeUserAttribute = removeUserAttribute;
            this.onUserIdentified = onUserIdentified;
            this.setUserIdentity = setUserIdentity;
            this.onIdentifyComplete = onIdentifyComplete;
            this.onLoginComplete = onLoginComplete;
            this.onLogoutComplete = onLogoutComplete;
            this.onModifyComplete = onModifyComplete;
            this.setOptOut = setOptOut;
        };

        function getId() {
            return moduleId;
        }

        function register(config) {
            if (!config) {
                window.console.log('You must pass a config object to register the kit ' + name);
                return;
            }

            if (!isObject(config)) {
                window.console.log('\'config\' must be an object. You passed in a ' + typeof config);
                return;
            }

            if (isObject(config.kits)) {
                config.kits[name] = {
                    constructor: constructor
                };
            } else {
                config.kits = {};
                config.kits[name] = {
                    constructor: constructor
                };
            }
            window.console.log('Successfully registered ' + name + ' to your mParticle configuration');
        }

        if (window && window.mParticle && window.mParticle.addForwarder) {
            window.mParticle.addForwarder({
                name: name,
                constructor: constructor,
                getId: getId
            });
        }

        window.mParticle.addForwarder({
            name: name,
            constructor: constructor,
            getId: getId
        });

        var webKitWrapper = {
            register: register
        };
    var webKitWrapper_1 = webKitWrapper.register;

    exports.default = webKitWrapper;
    exports.register = webKitWrapper_1;

    return exports;

}({}));
