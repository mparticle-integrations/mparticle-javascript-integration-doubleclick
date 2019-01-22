var common = require('./common'),
    TRANSACTIONS = 'transactions',
    ITEMS_SOLD = 'items_sold';

var commerceHandler = {
    logCommerceEvent: function(event) {
        if (event.EventDataType === 16) {
            var eventMapping = common.getEventMapping(event);
            if (eventMapping && eventMapping.result && eventMapping.match) {
                var gtagProperties = {};
                common.setCustomVariables(event, gtagProperties);
                common.setSendTo(eventMapping.match, event.CustomFlags, gtagProperties);
                if (event.CustomFlags && event.CustomFlags['DoubleClick.Counter']) {
                    gtagProperties.send_to += ('+' + event.CustomFlags['DoubleClick.Counter']);
                    //stringify number
                    gtagProperties.value = '' + event.ProductAction.TotalAmount;
                    gtagProperties.transaction_id = event.ProductAction.TransactionId;

                    if (event.CustomFlags['DoubleClick.Counter'] === TRANSACTIONS) {
                        common.sendGtag('purchase', gtagProperties);
                    } else if (event.CustomFlags['DoubleClick.Counter'] === ITEMS_SOLD) {
                        //stringify number
                        gtagProperties.quantity = '' + event.ProductAction.ProductList.length;

                        common.sendGtag('purchase', gtagProperties);
                    } else {
                        console.log('Counter type not valid. For sales conversions, use \'transactions\', or \'items_sold\'. See https://support.google.com/dcm/partner/answer/2823400?hl=en for more info')
                        return false;
                    }
                } else {
                    console.log('Counter type not valid. For sales conversions, use \'transactions\', or \'items_sold\'. See https://support.google.com/dcm/partner/answer/2823400?hl=en for more info')
                    return false;
                }
                window.gtag('event', 'purchase', gtagProperties);
            } else {
                console.log('Event not mapped. Event not sent.');
                return false;
            }
        }
    }
};

module.exports = commerceHandler;
