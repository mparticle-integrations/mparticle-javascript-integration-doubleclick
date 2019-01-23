var common = require('./common'),
    salesCounterTypes = {
        transactions: 1,
        items_sold: 1
    },
    ITEMS_SOLD = 'items_sold';

var commerceHandler = {
    logCommerceEvent: function(event) {
        if (event.EventDataType === mParticle.CommerceEventType.ProductPurchase) {
            var counter = event.CustomFlags && event.CustomFlags['DoubleClick.Counter'] ? event.CustomFlags['DoubleClick.Counter'] : null;
            if (!counter) {
                console.log('Event not sent. Sales conversions requires a custom flag of DoubleClick.Counter equal to \'transactions\', or \'items_sold\'. See https://support.google.com/dcm/partner/answer/2823400?hl=en for more info')
                return false;
            } else if (!salesCounterTypes[counter]) {
                console.log('Counter type not valid. For sales conversions, use a custom flag of DoubleClick.Counter equal to \'transactions\', or \'items_sold\'. See https://support.google.com/dcm/partner/answer/2823400?hl=en for more info')
                return false;
            }

            var eventMapping = common.getEventMapping(event);
            if (eventMapping && eventMapping.result && eventMapping.match) {
                var gtagProperties = {};
                common.setCustomVariables(event, gtagProperties);
                common.setSendTo(eventMapping.match, event.CustomFlags, gtagProperties);
                gtagProperties.send_to += ('+' + counter);
                //stringify number
                gtagProperties.value = '' + event.ProductAction.TotalAmount;
                gtagProperties.transaction_id = event.ProductAction.TransactionId;

                if (counter === ITEMS_SOLD) {
                    gtagProperties.quantity = '' + event.ProductAction.ProductList.length;
                }
                common.sendGtag('purchase', gtagProperties);
                return true;
            } else {
                console.log('Event not mapped. Event not sent.');
                return false;
            }
        }
    }
};

module.exports = commerceHandler;
