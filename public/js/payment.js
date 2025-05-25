document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('service');
    const amount = urlParams.get('amount');
    const serviceName = urlParams.get('serviceName');
    const bookingId = urlParams.get('bookingId');

    // Update payment summary
    if (serviceName && amount) {
        document.getElementById('service-name').textContent = serviceName;
        document.getElementById('amount').textContent = `UGX ${amount}`;
    }

    // Handle payment method selection
    const methods = document.querySelectorAll('.method input[type="radio"]');
    methods.forEach(method => {
        method.addEventListener('change', function() {
            // Remove active class from all methods
            document.querySelectorAll('.method').forEach(m => m.classList.remove('active'));
            
            // Add active class to selected method
            this.closest('.method').classList.add('active');

            // Show/hide mobile money fields
            const mobileMoneyFields = document.getElementById('mobileMoneyFields');
            if (this.value === 'mtn' || this.value === 'airtel') {
                mobileMoneyFields.style.display = 'block';
            } else {
                mobileMoneyFields.style.display = 'none';
            }
        });
    });

    // Handle payment submission
    document.getElementById('pay-button').addEventListener('click', async function() {
        try {
            const selectedMethod = document.querySelector('input[name="method"]:checked').value;
            let phoneNumber = null;

            // Validate phone number for mobile money payments
            if (selectedMethod === 'mtn' || selectedMethod === 'airtel') {
                const phoneInput = document.querySelector(`#${selectedMethod}-details .phone-input`);
                phoneNumber = phoneInput.value;

                if (!phoneNumber) {
                    throw new Error('Please enter a phone number for mobile money payment');
                }

                // Validate phone number format
                const mtnPattern = /^077\d{7}$/;
                const airtelPattern = /^075\d{7}$/;
                
                if (selectedMethod === 'mtn' && !mtnPattern.test(phoneNumber)) {
                    throw new Error('Please enter a valid MTN number (format: 077XXXXXXX)');
                }
                
                if (selectedMethod === 'airtel' && !airtelPattern.test(phoneNumber)) {
                    throw new Error('Please enter a valid Airtel number (format: 075XXXXXXX)');
                }
            }

            // Prepare payment data
            const paymentData = {
                bookingId,
                serviceId,
                amount,
                method: selectedMethod,
                phoneNumber: phoneNumber || null
            };

            // Send payment request to server
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
            alert('Payment initiated successfully! ' + 
                  (phoneNumber ? 'Please check your phone for the payment prompt.' : 'Please pay at the salon.'));

            // Redirect to confirmation page
            window.location.href = `/booking-confirmation.html?payment=${result.paymentId}&booking=${bookingId}`;

        } catch (error) {
            alert(error.message);
        }
    });
}); 