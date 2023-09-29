/* eslint-disable no-undef*/
describe('DoubleClick', function () {
    // -------------------DO NOT EDIT ANYTHING BELOW THIS LINE-----------------------
    var MessageTypes = {
            SessionStart: 1,
            SessionEnd: 2,
            PageView: 3,
            PageEvent: 4,
            CrashReport: 5,
            OptOut: 6,
            AppStateTransition: 10,
            Profile: 14,
            Commerce: 16
        },
        CommerceEventType = {
            ProductAddToCart: 10,
            ProductRemoveFromCart: 11,
            ProductCheckout: 12,
            ProductCheckoutOption: 13,
            ProductClick: 14,
            ProductViewDetail: 15,
            ProductPurchase: 16,
            ProductRefund: 17,
            PromotionView: 18,
            PromotionClick: 19,
            ProductAddToWishlist: 20,
            ProductRemoveFromWishlist: 21,
            ProductImpression: 22
        },
        ReportingService = function () {
            var self = this;

            this.id = null;
            this.event = null;

            this.cb = function (forwarder, event) {
                self.id = forwarder.id;
                self.event = event;
            };

            this.reset = function () {
                this.id = null;
                this.event = null;
            };
        },
        reportService = new ReportingService();

// -------------------DO NOT EDIT ANYTHING ABOVE THIS LINE-----------------------
// -------------------START EDITING BELOW:-----------------------
    var DoubleClickMockForwarder = function() {
        var self = this;

        this.trackCustomEventCalled = false;
        this.logPurchaseEventCalled = false;
        this.initializeCalled = false;

        this.trackCustomName = null;
        this.logPurchaseName = null;
        this.apiKey = null;
        this.appId = null;
        this.userId = null;
        this.userAttributes = {};
        this.userIdField = null;

        this.eventProperties = [];
        this.purchaseEventProperties = [];

        // stub your different methods to ensure they are being called properly
        this.initialize = function(appId, apiKey) {
            self.initializeCalled = true;
            self.apiKey = apiKey;
            self.appId = appId;
        };

        this.stubbedUserAttributeSettingMethod = function(userAttributes) {
            self.userId = id;
            userAttributes = userAttributes || {};
            if (Object.keys(userAttributes).length) {
                for (var key in userAttributes) {
                    if (userAttributes[key] === null) {
                        delete self.userAttributes[key];
                    }
                    else {
                        self.userAttributes[key] = userAttributes[key];
                    }
                }
            }
        };

        this.stubbedUserLoginMethod = function(id) {
            self.userId = id;
        };
    };

    before(function () {
        mParticle.init('test');
        mParticle.CommerceEventType = CommerceEventType;

        window.mParticle.isTestEnvironment = true;
    });

    beforeEach(function() {
        window.DoubleClickMockForwarder = new DoubleClickMockForwarder();
        // Include any specific settings that is required for initializing your SDK here
        var sdkSettings = {
            advertiserId: '123456',
            customVariables: '[{&quot;jsmap&quot;:null,&quot;map&quot;:&quot;Total Amount&quot;,&quot;maptype&quot;:&quot;EventAttributeClass.Name&quot;,&quot;value&quot;:&quot;u1&quot;},{&quot;jsmap&quot;:null,&quot;map&quot;:&quot;color&quot;,&quot;maptype&quot;:&quot;EventAttributeClass.Name&quot;,&quot;value&quot;:&quot;u2&quot;}]',
            eventMapping: '[{&quot;jsmap&quot;:&quot;-1978027768&quot;,&quot;map&quot;:&quot;-1711833867978608722&quot;,&quot;maptype&quot;:&quot;EventClass.Id&quot;,&quot;value&quot;:&quot;group tag2;activity tag2&quot;},{&quot;jsmap&quot;:&quot;-1107730368&quot;,&quot;map&quot;:&quot;-3234618101041058100&quot;,&quot;maptype&quot;:&quot;EventClass.Id&quot;,&quot;value&quot;:&quot;group tag3;activity tag3&quot;},{&quot;jsmap&quot;:&quot;-1592184962&quot;,&quot;map&quot;:&quot;-4153695833896571372&quot;,&quot;maptype&quot;:&quot;EventClassDetails.Id&quot;,&quot;value&quot;:&quot;group tag4;activity tag4&quot;}]'
        };
        // You may require userAttributes or userIdentities to be passed into initialization
        var userAttributes = {
            color: 'green'
        };
        var userIdentities = [{
            Identity: 'customerId',
            Type: mParticle.IdentityType.CustomerId
        }, {
            Identity: 'email',
            Type: mParticle.IdentityType.Email
        }, {
            Identity: 'facebook',
            Type: mParticle.IdentityType.Facebook
        }];

        mParticle.forwarder.init(sdkSettings, reportService.cb, true, null, userAttributes, userIdentities);
    });

    it('should initialize properly', function(done) {
        window.dataLayer[0][0].should.equal('js');
        (typeof window.dataLayer[0][1]).should.equal('object');

        window.dataLayer[1][0].should.equal('allow_custom_scripts');
        window.dataLayer[1][1].should.equal(true);
        window.dataLayer[2][0].should.equal('config');
        window.dataLayer[2][1].should.equal('123456');

        window.dataLayer = [];
        mParticle.forwarder.process({
            EventDataType: MessageTypes.PageEvent,
            EventCategory: mParticle.EventType.Unknown,
            EventName: 'Test Event',
            CustomFlags: {
                'DoubleClick.Counter': 'unique'
            }
        });
        window.dataLayer[0][2].should.have.property('send_to', 'DC-123456/group tag2/activity tag2+unique');

        window.dataLayer = [];
        mParticle.forwarder.process({
            EventDataType: MessageTypes.PageEvent,
            EventCategory: mParticle.EventType.Unknown,
            EventName: 'Test Event',
            CustomFlags: {
                'DoubleClick.Counter': 'per_session'
            }
        });
        window.dataLayer[0][0].should.equal('event');
        window.dataLayer[0][1].should.equal('conversion');
        window.dataLayer[0][2].should.have.property('send_to', 'DC-123456/group tag2/activity tag2+per_session');

        done();
    });

    it('should log event that has the appropriate custom flags', function(done) {
        window.dataLayer = [];
        mParticle.forwarder.process({
            EventDataType: MessageTypes.PageEvent,
            EventCategory: mParticle.EventType.Unknown,
            EventName: 'Test Event',
            EventAttributes: {
                'Total Amount': 123,
                color: 'blue'
            },
            CustomFlags: {
                'DoubleClick.Counter': 'standard'
            }
        });
        window.dataLayer[0][0].should.equal('event');
        window.dataLayer[0][1].should.equal('conversion');
        window.dataLayer[0][2].should.have.property('u1', 123);
        window.dataLayer[0][2].should.have.property('u2', 'blue');
        window.dataLayer[0][2].should.have.property('send_to', 'DC-123456/group tag2/activity tag2+standard');

        window.dataLayer = [];
        mParticle.forwarder.process({
            EventDataType: MessageTypes.PageEvent,
            EventCategory: mParticle.EventType.Unknown,
            EventName: 'Test Event',
            CustomFlags: {
                'DoubleClick.Counter': 'unique'
            }
        });
        window.dataLayer[0][2].should.have.property('send_to', 'DC-123456/group tag2/activity tag2+unique');

        window.dataLayer = [];
        mParticle.forwarder.process({
            EventDataType: MessageTypes.PageEvent,
            EventCategory: mParticle.EventType.Unknown,
            EventName: 'Test Event',
            CustomFlags: {
                'DoubleClick.Counter': 'per_session'
            }
        });
        window.dataLayer[0][0].should.equal('event');
        window.dataLayer[0][1].should.equal('conversion');
        window.dataLayer[0][2].should.have.property('send_to', 'DC-123456/group tag2/activity tag2+per_session');

        done();
    });

    it('should not log an event that has no custom flag, or an incorrect custom flag', function(done) {
        window.dataLayer = [];

        mParticle.forwarder.process({
            EventDataType: MessageTypes.PageEvent,
            EventCategory: mParticle.EventType.Unknown,
            EventName: 'Test Event'
        });

        mParticle.forwarder.process({
            EventDataType: MessageTypes.PageEvent,
            EventCategory: mParticle.EventType.Unknown,
            EventName: 'Test Event',
            CustomFlags: {
                'DoubleClick.Counter': 'invalidCounter'
            }
        });

        window.dataLayer.length.should.equal(0);

        done();
    });

    it('should log a product purchase commerce event with custom flag of transactions', function(done) {
        window.dataLayer = [];

        mParticle.forwarder.process({
            EventName: 'eCommerce - Purchase',
            EventDataType: MessageTypes.Commerce,
            EventCategory: mParticle.CommerceEventType.ProductPurchase,
            ProductAction: {
                ProductActionType: mParticle.ProductActionType.Purchase,
                ProductList: [
                    {
                        Sku: '12345',
                        Name: 'iPhone 6',
                        Category: 'Phones',
                        Brand: 'iPhone',
                        Variant: '6',
                        Price: 400,
                        TotalAmount: 400,
                        CouponCode: 'coupon-code',
                        Quantity: 1
                    },
                    {
                        Sku: '12345',
                        Name: 'iPhone 6',
                        Category: 'Phones',
                        Brand: 'iPhone',
                        Variant: '6',
                        Price: 400,
                        TotalAmount: 400,
                        CouponCode: 'coupon-code',
                        Quantity: 1
                    }
                ],
                TransactionId: 'tid123',
                Affiliation: 'my-affiliation',
                TotalAmount: 850,
                TaxAmount: 40,
                ShippingAmount: 10,
                CouponCode: null
            },
            CustomFlags: {
                'DoubleClick.Counter': 'transactions'
            }
        });
        window.dataLayer[0][0].should.equal('event');
        window.dataLayer[0][1].should.equal('purchase');
        window.dataLayer[0][2].should.have.property('value', '850');
        window.dataLayer[0][2].should.have.property('transaction_id', 'tid123');
        window.dataLayer[0][2].should.not.have.property('quantity');

        done();
    });

    it('should log a product purchase commerce event with custom flag of items_sold', function(done) {
        window.dataLayer = [];

        mParticle.forwarder.process({
            EventName: 'eCommerce - Purchase',
            EventDataType: MessageTypes.Commerce,
            EventCategory: mParticle.CommerceEventType.ProductPurchase,
            ProductAction: {
                ProductActionType: mParticle.ProductActionType.Purchase,
                ProductList: [
                    {
                        Sku: '12345',
                        Name: 'iPhone 6',
                        Category: 'Phones',
                        Brand: 'iPhone',
                        Variant: '6',
                        Price: 400,
                        TotalAmount: 400,
                        CouponCode: 'coupon-code',
                        Quantity: 1
                    },
                    {
                        Sku: '12345',
                        Name: 'iPhone 6',
                        Category: 'Phones',
                        Brand: 'iPhone',
                        Variant: '6',
                        Price: 400,
                        TotalAmount: 400,
                        CouponCode: 'coupon-code',
                        Quantity: 1
                    }
                ],
                TransactionId: 'tid123',
                Affiliation: 'my-affiliation',
                TotalAmount: 850,
                TaxAmount: 40,
                ShippingAmount: 10,
                CouponCode: null
            },
            CustomFlags: {
                'DoubleClick.Counter': 'items_sold'
            }
        });
        window.dataLayer[0][0].should.equal('event');
        window.dataLayer[0][1].should.equal('purchase');
        window.dataLayer[0][2].should.have.property('value', '850');
        window.dataLayer[0][2].should.have.property('transaction_id', 'tid123');
        window.dataLayer[0][2].should.have.property('quantity', '2');

        done();
    });

    it('should not log an event that is not mapped', function(done) {
        window.dataLayer = [];
        var result = mParticle.forwarder.process({
            EventDataType: MessageTypes.PageEvent,
            EventCategory: mParticle.EventType.Unknown,
            EventName: 'abcdef',
            EventAttributes: {
                'Total Amount': 123,
                color: 'blue',
            },
            CustomFlags: {
                'DoubleClick.Counter': 'standard',
            },
        });

        result.should.equal(
            'Error logging event or event type not supported on forwarder DoubleclickDFP'
        );

        done();
    });

    it('should not log a product purchase commerce event without a custom flag or with an incorrect custom flag', function(done) {
        window.dataLayer = [];

        mParticle.forwarder.process({
            EventName: 'eCommerce - Purchase',
            EventDataType: MessageTypes.Commerce,
            EventCategory: mParticle.CommerceEventType.ProductPurchase,
            ProductAction: {
                ProductActionType: mParticle.ProductActionType.Purchase,
                ProductList: [
                    {
                        Sku: '12345',
                        Name: 'iPhone 6',
                        Category: 'Phones',
                        Brand: 'iPhone',
                        Variant: '6',
                        Price: 400,
                        TotalAmount: 400,
                        CouponCode: 'coupon-code',
                        Quantity: 1
                    },
                    {
                        Sku: '12345',
                        Name: 'iPhone 6',
                        Category: 'Phones',
                        Brand: 'iPhone',
                        Variant: '6',
                        Price: 400,
                        TotalAmount: 400,
                        CouponCode: 'coupon-code',
                        Quantity: 1
                    }
                ],
                TransactionId: 'tid123',
                Affiliation: 'my-affiliation',
                TotalAmount: 850,
                TaxAmount: 40,
                ShippingAmount: 10,
                CouponCode: null
            },
            CustomFlags: {
                'DoubleClick.Counter': 'invalidCounter'
            }
        });

        mParticle.forwarder.process({
            EventName: 'eCommerce - Purchase',
            EventDataType: MessageTypes.Commerce,
            EventCategory: mParticle.CommerceEventType.ProductPurchase,
            ProductAction: {
                ProductActionType: mParticle.ProductActionType.Purchase,
                ProductList: [
                    {
                        Sku: '12345',
                        Name: 'iPhone 6',
                        Category: 'Phones',
                        Brand: 'iPhone',
                        Variant: '6',
                        Price: 400,
                        TotalAmount: 400,
                        CouponCode: 'coupon-code',
                        Quantity: 1
                    },
                    {
                        Sku: '12345',
                        Name: 'iPhone 6',
                        Category: 'Phones',
                        Brand: 'iPhone',
                        Variant: '6',
                        Price: 400,
                        TotalAmount: 400,
                        CouponCode: 'coupon-code',
                        Quantity: 1
                    }
                ],
                TransactionId: 'tid123',
                Affiliation: 'my-affiliation',
                TotalAmount: 850,
                TaxAmount: 40,
                ShippingAmount: 10,
                CouponCode: null
            }
        });

        window.dataLayer.length.should.equal(0);

        done();
    });
});
