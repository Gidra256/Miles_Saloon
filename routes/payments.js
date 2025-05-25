const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get Stripe publishable key
router.get('/api/stripe-key', (req, res) => {
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Initialize payment
router.post('/api/payments/initialize', async (req, res) => {
    try {
        const { bookingId, paymentMethod, provider, phoneNumber } = req.body;

        const booking = await Booking.findById(bookingId).populate('service');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const payment = new Payment({
            booking: bookingId,
            service: booking.service._id,
            amount: booking.service.price,
            method: paymentMethod,
            status: 'pending'
        });

        if (paymentMethod === 'mobile-money') {
            payment.phoneNumber = phoneNumber;
            payment.provider = provider;
            
            // Here you would integrate with MTN or Airtel API
            // For now, we'll simulate the mobile money request
            const transactionId = 'MM-' + Date.now();
            payment.transactionId = transactionId;

            await payment.save();
            
            return res.json({
                success: true,
                message: 'Mobile money payment initiated',
                transactionId,
                instructions: `Please confirm the payment on your ${provider.toUpperCase()} mobile money number ${phoneNumber}`
            });
        }

        if (paymentMethod === 'card') {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: booking.service.price * 100, // Convert to cents
                currency: 'usd',
                payment_method_types: ['card'],
                metadata: {
                    bookingId: bookingId,
                    serviceName: booking.service.name
                }
            });

            payment.transactionId = paymentIntent.id;
            await payment.save();

            return res.json({
                success: true,
                clientSecret: paymentIntent.client_secret
            });
        }

        if (paymentMethod === 'cash') {
            payment.status = 'pending';
            payment.transactionId = 'CASH-' + Date.now();
            await payment.save();

            return res.json({
                success: true,
                message: 'Cash payment recorded',
                instructions: 'Please pay at the salon before your appointment'
            });
        }

    } catch (error) {
        console.error('Payment initialization error:', error);
        res.status(500).json({ message: 'Failed to initialize payment' });
    }
});

// Confirm mobile money payment
router.post('/api/payments/confirm-mobile-money', async (req, res) => {
    try {
        const { transactionId, status } = req.body;

        const payment = await Payment.findOne({ transactionId });
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        payment.status = status;
        await payment.save();

        if (status === 'completed') {
            const booking = await Booking.findById(payment.booking);
            booking.paymentStatus = 'paid';
            booking.paymentId = payment._id;
            await booking.save();
        }

        res.json({ success: true, status });

    } catch (error) {
        console.error('Mobile money confirmation error:', error);
        res.status(500).json({ message: 'Failed to confirm mobile money payment' });
    }
});

// Webhook for Stripe events
router.post('/api/payments/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Stripe webhook error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        try {
            const payment = await Payment.findOne({ transactionId: paymentIntent.id });
            if (payment) {
                payment.status = 'completed';
                await payment.save();

                const booking = await Booking.findById(payment.booking);
                booking.paymentStatus = 'paid';
                booking.paymentId = payment._id;
                await booking.save();
            }
        } catch (error) {
            console.error('Payment success handling error:', error);
        }
    }

    res.json({ received: true });
});

// Confirm cash payment (admin only)
router.post('/api/payments/confirm-cash', async (req, res) => {
    try {
        const { bookingId } = req.body;

        const payment = await Payment.findOne({ 
            booking: bookingId,
            method: 'cash'
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        payment.status = 'completed';
        await payment.save();

        const booking = await Booking.findById(bookingId);
        booking.paymentStatus = 'paid';
        booking.paymentId = payment._id;
        await booking.save();

        res.json({ success: true, message: 'Cash payment confirmed' });

    } catch (error) {
        console.error('Cash payment confirmation error:', error);
        res.status(500).json({ message: 'Failed to confirm cash payment' });
    }
});

// Get payment status
router.get('/api/payments/:bookingId', async (req, res) => {
    try {
        const payment = await Payment.findOne({ booking: req.params.bookingId });
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.json({
            status: payment.status,
            method: payment.method,
            amount: payment.amount,
            transactionId: payment.transactionId
        });

    } catch (error) {
        console.error('Payment status error:', error);
        res.status(500).json({ message: 'Failed to get payment status' });
    }
});

module.exports = router; 