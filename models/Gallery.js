const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    imageUrl: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'general'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Gallery', gallerySchema); 