const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            addOns: [
                {
                    addOn: { type: mongoose.Schema.Types.ObjectId, ref: 'AddOn' },
                    quantity: { type: Number, default: 1 },
                    price: { type: Number, default: 0 },
                    customMessage: { type: String }
                }
            ]
        }
    ],
    total: { type: Number, required: true },
    deliveryDate: { type: Date, required: true },
    deliveryTime: { type: String, required: true },
    senderName: { type: String, required: true },
    senderPhone: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, required: true },
    address: { type: String, required: true },
    messageCard: String,
    specialInstructions: String,
    createdAt: { type: Date, default: Date.now },
    // Admin related fields
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined', 'completed'],
        default: 'pending'
    },
    receipt: { type: String }, // URL or path to uploaded receipt image
    receiptHtml: { type: String }, // inline HTML string of the generated receipt
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    completedAt: { type: Date }
});

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
