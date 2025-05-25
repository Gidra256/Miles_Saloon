// Exchange rates (to be updated with real-time rates in production)
const exchangeRates = {
    UGX: 1,
    USD: 3800,  // 1 USD = 3800 UGX
    EUR: 4100,  // 1 EUR = 4100 UGX
    GBP: 4800   // 1 GBP = 4800 UGX
};

let currentCurrency = 'UGX';
let selectedPaymentMethod = null;
let selectedProvider = null;

// Initialize the payment interface
document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('service');
    const amount = urlParams.get('amount');
    const serviceName = urlParams.get('serviceName');
    const bookingId = urlParams.get('bookingId');

    // Update payment summary
    if (serviceName && amount) {
        updatePaymentSummary(serviceName, amount);
    }

    // Initialize Stripe
    initializeStripe();
});

// Update payment summary with currency conversion
function updatePaymentSummary(serviceName, amount) {
    const baseAmount = parseInt(amount);
    document.getElementById('service-name').textContent = serviceName;
    updateAmountDisplay(baseAmount);
}

function updateAmountDisplay(baseAmount) {
    const rate = exchangeRates[currentCurrency] / exchangeRates.UGX;
    const convertedAmount = (baseAmount * rate).toFixed(2);
    const formattedAmount = formatCurrency(convertedAmount, currentCurrency);
    
    document.getElementById('service-price').textContent = formattedAmount;
    document.getElementById('total-amount').textContent = formattedAmount;
}

function formatCurrency(amount, currency) {
    switch(currency) {
        case 'UGX':
            return `UGX ${Math.round(amount).toLocaleString()}`;
        case 'USD':
            return `$${amount}`;
        case 'EUR':
            return `€${amount}`;
        case 'GBP':
            return `£${amount}`;
        default:
            return `${amount} ${currency}`;
    }
}

// Currency selector handler
function updateCurrency() {
    const select = document.getElementById('currency-select');
    currentCurrency = select.value;
    const amount = new URLSearchParams(window.location.search).get('amount');
    updateAmountDisplay(parseInt(amount));
}

// Payment method selection
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update UI
    document.querySelectorAll('.method-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector(`[onclick="selectPaymentMethod('${method}')"]`).classList.add('active');
    
    // Show/hide relevant forms
    document.getElementById('mobile-money-form').classList.toggle('active', method === 'mobile-money');
    document.getElementById('card-payment-form').classList.toggle('active', method === 'card');
}

// Mobile money provider selection
function selectProvider(provider) {
    selectedProvider = provider;
    
    // Update UI
    document.querySelectorAll('.provider-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector(`[onclick="selectProvider('${provider}')"]`).classList.add('active');
}

// Initialize Stripe elements
function initializeStripe() {
    const stripe = Stripe('YOUR_PUBLISHABLE_KEY');
    const elements = stripe.elements();
    
    const card = elements.create('card', {
        style: {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        }
    });

    card.mount('#card-element');

    // Handle validation errors
    card.addEventListener('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });

    // Handle form submission
    const form = document.getElementById('payment-form');
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        handleCardPayment(stripe, card);
    });
}

// Handle card payment
async function handleCardPayment(stripe, card) {
    const loading = document.getElementById('loading');
    const button = document.querySelector('#payment-form button');
    
    loading.style.display = 'block';
    button.disabled = true;

    try {
        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: 'card',
            card: card,
            billing_details: {
                name: document.getElementById('customer-name').value,
                email: document.getElementById('customer-email').value
            }
        });

        if (error) {
            throw error;
        }

        // Send payment to server
        await processPayment('card', { payment_method_id: paymentMethod.id });
        
    } catch (error) {
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = error.message;
        loading.style.display = 'none';
        button.disabled = false;
    }
}

// Handle mobile money payment
document.getElementById('mobile-money-payment-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    if (!selectedProvider) {
        alert('Please select a mobile money provider (MTN or Airtel)');
        return;
    }

    const phoneNumber = document.getElementById('phone-number').value;
    
    // Validate phone number format
    const mtnPattern = /^077\d{7}$/;
    const airtelPattern = /^075\d{7}$/;
    
    if (selectedProvider === 'mtn' && !mtnPattern.test(phoneNumber)) {
        alert('Please enter a valid MTN number (format: 077XXXXXXX)');
        return;
    }
    
    if (selectedProvider === 'airtel' && !airtelPattern.test(phoneNumber)) {
        alert('Please enter a valid Airtel number (format: 075XXXXXXX)');
        return;
    }

    try {
        await processPayment('mobile_money', {
            provider: selectedProvider,
            phone_number: phoneNumber
        });
    } catch (error) {
        alert(error.message);
    }
});

// Process payment with server
async function processPayment(paymentType, paymentDetails) {
    const urlParams = new URLSearchParams(window.location.search);
    
    const paymentData = {
        booking_id: urlParams.get('bookingId'),
        service_id: urlParams.get('service'),
        amount: urlParams.get('amount'),
        currency: currentCurrency,
        payment_type: paymentType,
        ...paymentDetails
    };

    try {
        const response = await fetch('/api/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Payment failed');
        }

        // Handle successful payment
        if (paymentType === 'mobile_money') {
            alert('Payment initiated! Please check your phone for the payment prompt.');
        }

        // Redirect to success page
        window.location.href = `/payment-success.html?payment=${result.paymentId}&booking=${paymentData.booking_id}&amount=${paymentData.amount}&currency=${paymentData.currency}`;

    } catch (error) {
        throw new Error(error.message || 'Payment processing failed');
    }
} 