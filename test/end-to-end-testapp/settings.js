var SDKsettings = {
    apiKey: 'testAPIKey',
    advertiserId: '123456',
    conversionId: 'AW-123456',
    enableGtag: 'True',
    consentMappingWeb: '[{"map":"ad_user_data","value":"ad_user_data"},{"map":"ad_personalization","value":"ad_personalization"},{"map":"ad_storage","value":"ad_storage"},{"map":"analytics_storage","value":"analytics_storage"}]',
    defaultAdUserDataConsent: 'Granted',
    defaultAdPersonalizationConsent: 'Granted',
    defaultAdStorageConsentWeb: 'Granted',
    defaultAnalyticsStorageConsentWeb: 'Granted',
    eventMapping: '[{"jsmap":"-1978027768","map":"-1711833867978608722","maptype":"EventClass.Id","value":"group tag2;activity tag2"}]',
    customVariables: '[]',
    customParams: '[{"jsmap":null,"map":"test_attribute","maptype":"EventAttributeClass.Name","value":"match_id"}]'
    /* fill in SDKsettings with any particular settings or options your sdk requires in order to
    initialize, this may be apiKey, projectId, primaryCustomerType, etc. These are passed
    into the src/initialization.js file as the
    */
};

// Do not edit below:
module.exports = SDKsettings;
