# ccHeroes / ProcessTransact Payment Gateway

Credit/debit card payments via ccHeroes (ProcessTransact).

## Configuration

Add to `.env`:

```env
# Test mode (sandbox)
CCHEROES_MERCHANT_NAME="Dummy1"
CCHEROES_MERCHANT_PASSWORD="test_password"
CCHEROES_TEST_MODE="true"

# Live mode (production)
# CCHEROES_MERCHANT_NAME="your_live_merchant_name"
# CCHEROES_MERCHANT_PASSWORD="your_live_merchant_password"
# CCHEROES_TEST_MODE="false"
```

## API Endpoints

- **Test:** https://sandbox.processtransact.com/api/json.ashx
- **Live:** https://gw.processtransact.com/api/json.ashx

## Test Card (sandbox only)

- **Card number:** 4111111111111111
- **Expiry:** Any future date (e.g. 12/25)
- **CVV:** Any 3 digits
- **Name:** Any name

## Flow

1. Customer enters card details at checkout
2. On "Place order", the app calls `/api/payment/charge` with card + amount
3. If charge succeeds → create order with status PROCESSING
4. If charge fails → show error, no order created

## Customizing the API Request

The ProcessTransact API may use different field names. If payments fail, check the gateway response and update `src/lib/payment.ts` to match the expected format.

Contact **support@ccheroes.com** for:
- Live credentials
- Exact API request/response format
- Field names and values
