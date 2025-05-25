const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'UGX'
    },
    method: {
        type: String,
        enum: ['cash', 'mtn', 'airtel'],
        required: true
    },
    phoneNumber: {
        type: String,
        required: function() {
            return this.method === 'mtn' || this.method === 'airtel';
        }
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    transactionId: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema); 