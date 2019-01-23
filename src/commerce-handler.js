var common = require('./common'),
    salesCounterTypes = {
        transactions: 1,
        items_sold: 1
    },
    ITEMS_SOLD = 'items_sold';

var commerceHandler = {
    logCommerceEvent: function(event) {
        if (event.EventDataType === mParticle.CommerceEventType.ProductPurchase) {
            var counter = event.CustomFlags['DoubleClick.Counter'];
            if (!counter) {
                console.log('Event not sent. Sales conversions requires a custom flag of DoubleClick.Counter equal to \'transactions\', or \'items_sold\'. See https://support.google.com/dcm/partner/answer/2823400?hl=en for more info')
                return;
            } else if (!salesCounterTypes[counter]) {
                console.log('Counter type not valid. For sales conversions, use a custom flag of DoubleClick.Counter equal to \'transactions\', or \'items_sold\'. See https://support.google.com/dcm/partner/answer/2823400?hl=en for more info')
                return;
            }

            var eventMapping = common.getEventMapping(event);
            if (eventMapping && eventMapping.result && eventMapping.match) {
                var gtagProperties = {};
                common.setCustomVariables(event, gtagProperties);
                common.setSendTo(eventMapping.match, event.CustomFlags, gtagProperties);
                gtagProperties.send_to += ('+' + event.CustomFlags['DoubleClick.Counter']);
                //stringify number
                gtagProperties.value = '' + event.ProductAction.TotalAmount;
                gtagProperties.transaction_id = event.ProductAction.TransactionId;

                if (counter === ITEMS_SOLD) {
                    gtagProperties.quantity = '' + event.ProductAction.ProductList.length;
                }
                common.sendGtag('purchase', gtagProperties);
            } else {
                console.log('Event not mapped. Event not sent.');
                return false;
            }
        }
    }
};

module.exports = commerceHandler;
