import { SePayPgClient } from 'sepay-pg-node';

const sepayConfig = {
    merchantId: (process.env.SEPAY_MERCHANT_ID || '').trim(),
    secretKey: (process.env.SEPAY_SECRET_KEY || '').trim(),
    env: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
};

// Initialize SePay Client
const sepayClient = new SePayPgClient({
    merchant_id: sepayConfig.merchantId,
    secret_key: sepayConfig.secretKey,
    env: sepayConfig.env
});

export const getSePayConfig = () => sepayConfig;

export const createPaymentUrl = (
    params: {
        amount: number;
        orderId: string;
        description: string;
        userId: string;
        successUrl: string;
        errorUrl: string;
        cancelUrl: string;
    }
) => {
    // 1. Generate Signed Fields using SDK
    const signedFields = sepayClient.checkout.initOneTimePaymentFields({
        operation: 'PURCHASE',
        payment_method: 'BANK_TRANSFER', // Optional, but good to be explicit
        order_invoice_number: params.orderId,
        order_amount: params.amount,
        currency: 'VND',
        order_description: params.description,
        customer_id: params.userId,
        success_url: params.successUrl,
        error_url: params.errorUrl,
        cancel_url: params.cancelUrl,
    });

    // 2. Get Base Checkout URL
    const baseUrl = sepayClient.checkout.initCheckoutUrl();

    // 3. Construct Full URL (SDK returns fields object, we need to serialize to query string)
    const queryParams = new URLSearchParams();

    // SDK returns objects with signature included. We just need to map them to query params.
    Object.entries(signedFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
        }
    });

    const fullUrl = `${baseUrl}?${queryParams.toString()}`;

    // Debugging logs
    if (process.env.NODE_ENV === 'development') {
        console.log('SePay Config Merchant:', sepayConfig.merchantId);
        console.log('SePay SDK Generated Signature:', signedFields.signature);
    }

    return {
        endpoint: baseUrl,
        payload: signedFields // Return the object for form submission if needed, or just use fullUrl redirect
    };
};

export const checkOrderStatus = async (orderInvoiceNumber: string) => {
    // Reuse existing implementation but verify merchant config
    const apiBaseUrl = sepayConfig.env === 'sandbox'
        ? 'https://pgapi-sandbox.sepay.vn/v1'
        : 'https://pgapi.sepay.vn/v1';

    const auth = Buffer.from(`${sepayConfig.merchantId}:${sepayConfig.secretKey}`).toString('base64');

    try {
        const response = await fetch(`${apiBaseUrl}/order?q=${orderInvoiceNumber}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`SePay API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Check order status error:', error);
        throw error;
    }
};
