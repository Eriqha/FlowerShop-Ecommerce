const Order = require('../models/Order');
const AddOn = require('../models/AddOn');
const path = require('path');

exports.createOrder = async (req, res) => {
    try {
        // Validate and normalize incoming items/addOns: fetch authoritative add-on prices from DB
        const payload = { ...req.body, user: req.user._id };
        if (Array.isArray(payload.items)) {
            for (const item of payload.items) {
                if (Array.isArray(item.addOns)) {
                    for (const ao of item.addOns) {
                        // ao.addOn may be an id or object; normalize to id
                        const addOnId = ao.addOn || ao.addOnId || null;
                        if (addOnId) {
                            try {
                                const addonDoc = await AddOn.findById(addOnId).lean();
                                if (addonDoc) {
                                    ao.addOn = addonDoc._id; // keep as id for ref
                                    ao.price = Number(addonDoc.price || ao.price || 0);
                                    ao.quantity = Number(ao.quantity || 1);
                                } else {
                                    // invalid addOn id — remove or keep but set price 0
                                    ao.price = Number(ao.price || 0);
                                    ao.quantity = Number(ao.quantity || 1);
                                }
                            } catch (e) {
                                // lookup failed — fallback to provided values
                                ao.price = Number(ao.price || 0);
                                ao.quantity = Number(ao.quantity || 1);
                            }
                        } else {
                            // no addOn id provided, ensure defaults
                            ao.price = Number(ao.price || 0);
                            ao.quantity = Number(ao.quantity || 1);
                        }
                    }
                }
            }
        }

        const order = await Order.create(payload);
        const populated = await Order.findById(order._id).populate('items.product').populate('items.addOns.addOn');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        // Allow user to fetch their own orders, or admin to fetch any user's orders
        if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.userId) {
            return res.status(403).json({ message: 'Not authorized to view these orders' });
        }
        const orders = await Order.find({ user: req.params.userId }).populate('items.product').populate('items.addOns.addOn');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin: get all orders
exports.getAllOrders = async (req, res) => {
    try {
        console.log('getAllOrders called by', req.user?._id, 'role:', req.user?.role);
        const orders = await Order.find().populate('user', 'name email').populate('items.product').populate('items.addOns.addOn').sort('-createdAt');
        res.json(orders);
    } catch (err) {
        console.error('getAllOrders error', err);
        res.status(500).json({ message: err.message });
    }
};

// Admin: get single order by id
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('user', 'name email').populate('items.product').populate('items.addOns.addOn');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        // Allow owner or admin
        if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
// Optional imports: keep backend from crashing if pdfkit/nodemailer are not installed
let PDFDocument;
let nodemailer;
let pdfkitAvailable = false;
let nodemailerAvailable = false;
try {
    PDFDocument = require('pdfkit');
    pdfkitAvailable = true;
} catch (e) {
    console.warn('[orderController] pdfkit not available. Skipping PDF generation. Run `npm install pdfkit` to enable.');
}
try {
    nodemailer = require('nodemailer');
    nodemailerAvailable = true;
} catch (e) {
    console.warn('[orderController] nodemailer not available. Skipping email sending. Run `npm install nodemailer` to enable.');
}

const ensureUploadsDir = async () => {
    const dir = path.join(__dirname, '..', 'public', 'uploads', 'receipts');
    try {
        if (!fs.existsSync(dir)) {
            await mkdir(dir, { recursive: true });
        }
        return dir;
    } catch (err) {
        console.error('[ensureUploadsDir] Failed to create uploads/receipts dir', err);
        return null; // cannot create public uploads dir
    }
};

const generateReceiptHtml = async (order) => {
    const dir = await ensureUploadsDir();
    if (!dir) {
        console.warn('[generateReceiptHtml] public uploads dir is not available. Skipping HTML receipt generation.');
        return null;
    }
    const receiptFilename = `receipt_${order._id}.html`;
    const receiptPath = `/uploads/receipts/${receiptFilename}`;
    const filePath = path.join(dir, receiptFilename);

    const formatCurrency = (v) => {
        if (typeof v !== 'number') v = Number(v) || 0;
        return v.toFixed(2);
    };

    // subtotal includes product lines plus any add-ons attached to each item
    const subtotal = (order.items || []).reduce((s, it) => {
        const prodTotal = Number(it.price || 0) * Number(it.quantity || 0);
        const addOnsTotal = (it.addOns || []).reduce((aSum, ao) => aSum + (Number(ao.price || 0) * Number(ao.quantity || 1) * Number(it.quantity || 1)), 0);
        return s + prodTotal + addOnsTotal;
    }, 0);
    const salesTax = +(subtotal * 0.05).toFixed(2); // 5% sample tax
    const shipping = 0.00; // adjust if you store shipping on order
    const total = +(subtotal + salesTax + shipping).toFixed(2);

    const receiptDate = (order.createdAt && new Date(order.createdAt)).toLocaleDateString() || new Date().toLocaleDateString();

    const html = `<!doctype html>
        <html>
            <head>
                <meta charset="utf-8">
                <title>Order Receipt - ${order._id}</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222; margin: 0; padding: 40px; }
                    .container { max-width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 40px; }
                    .header { display:flex; justify-content:space-between; align-items:center; }
                    .company { font-weight:700; }
                    .upload-btn { border:1px solid #d7e3f0; padding:10px 16px; border-radius:6px; color:#2b6cb0; background:#fff; }
                    .title { text-align:center; font-size:32px; letter-spacing:4px; color:#1e4a86; margin:30px 0; }
                    .two-col { display:flex; justify-content:space-between; }
                    .bill, .meta { width:48%; }
                    table.items { width:100%; border-collapse:collapse; margin-top:20px; }
                    table.items th { background:#0b60a9; color:#fff; padding:10px; text-align:left; }
                    table.items td { padding:10px; border-bottom:1px solid #eee; }
                    .right { text-align:right; }
                    .totals { margin-top:20px; width: 300px; float:right; }
                    .totals table { width:100%; }
                    .totals td { padding:6px 8px; }
                    .totals .label { color:#666; }
                    .totals .amount { text-align:right; font-weight:700; }
                    .notes { clear:both; margin-top:40px; color:#555; font-size:13px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div>
                            <div class="company">Your Company Inc.</div>
                            <div style="font-size:12px;color:#666">1234 Company St,<br/>Company Town, ST 12345</div>
                        </div>
                        <div><button class="upload-btn">Upload Logo</button></div>
                    </div>

                    <div class="title">ORDER RECEIPT</div>

                    <div class="two-col">
                        <div class="bill">
                            <strong>Billed To</strong>
                            <div style="margin-top:8px">${order.user?.name || order.recipientName || 'Customer Name'}</div>
                            <div style="font-size:12px;color:#666;margin-top:6px">${order.address || ''}</div>
                        </div>
                        <div class="meta">
                            <div style="text-align:right"><strong>Receipt #</strong><br/>${order._id}</div>
                            <div style="text-align:right;margin-top:12px"><strong>Receipt date</strong><br/>${receiptDate}</div>
                        </div>
                    </div>

                    <table class="items">
                        <thead>
                            <tr>
                                <th style="width:60px">QTY</th>
                                <th>Description</th>
                                <th style="width:140px" class="right">Unit Price</th>
                                <th style="width:140px" class="right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ (order.items || []).map(i => {
                                const name = (i.product && (i.product.name || i.product.title)) || 'Item';
                                const qty = Number(i.quantity || 0);
                                const unit = Number(i.price || 0);
                                const amount = +(qty * unit).toFixed(2);
                                // main product row
                                let rows = `<tr>
                                    <td>${qty}</td>
                                    <td>${name}</td>
                                    <td class="right">${formatCurrency(unit)}</td>
                                    <td class="right">${formatCurrency(amount)}</td>
                                </tr>`;
                                // include add-ons (if any)
                                (i.addOns || []).forEach(ao => {
                                    const aoQty = Number(ao.quantity || 1) * Number(qty || 1);
                                    const aoUnit = Number(ao.price || 0);
                                    const aoAmount = +(aoQty * aoUnit).toFixed(2);
                                    const aoLabel = (ao.addOn && ((typeof ao.addOn === 'object') ? (ao.addOn.name || ao.addOn._id) : ao.addOn)) || 'Add-on';
                                    const aoName = ao.customMessage ? `${aoLabel} (${ao.customMessage})` : `${aoLabel}`;
                                    rows += `<tr>
                                        <td>${aoQty}</td>
                                        <td style="padding-left:18px; font-size:0.95em; color:#444">+ ${aoName}</td>
                                        <td class="right">${formatCurrency(aoUnit)}</td>
                                        <td class="right">${formatCurrency(aoAmount)}</td>
                                    </tr>`;
                                });
                                return rows;
                            }).join('') }
                            <tr>
                                <td colspan="4" style="border-top:1px solid #e6eef8"></td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="totals">
                        <table>
                            <tr>
                                <td class="label">Subtotal</td>
                                <td class="amount">${formatCurrency(subtotal)}</td>
                            </tr>
                            <tr>
                                <td class="label">Sales Tax (5%)</td>
                                <td class="amount">${formatCurrency(salesTax)}</td>
                            </tr>
                            <tr>
                                <td class="label">Shipping</td>
                                <td class="amount">${formatCurrency(shipping)}</td>
                            </tr>
                            <tr style="border-top:2px solid #0b60a9">
                                <td class="label"><strong>Total (USD)</strong></td>
                                <td class="amount">${formatCurrency(total)}</td>
                            </tr>
                        </table>
                    </div>

                    <div class="notes">
                        <strong>Notes</strong>
                        <p>Thank you for your purchase! All sales are final after 30 days. Please retain this receipt for warranty or exchange purposes.</p>
                        <p>For questions or support, contact us at support@example.com or (555) 987-6543.</p>
                    </div>
                </div>
            </body>
        </html>`;

    try {
        await writeFile(filePath, html);
        return { path: receiptPath, html };
    } catch (err) {
        console.error('[generateReceiptHtml] Error writing receipt HTML file:', err);
        return { path: null, html };
    }
};

// Build receipt HTML string without writing to disk
const buildReceiptHtmlContent = (order) => {
    const formatCurrency = (v) => {
        if (typeof v !== 'number') v = Number(v) || 0;
        return v.toFixed(2);
    };

    const subtotal = (order.items || []).reduce((s, it) => {
        const prodTotal = Number(it.price || 0) * Number(it.quantity || 0);
        const addOnsTotal = (it.addOns || []).reduce((aSum, ao) => aSum + (Number(ao.price || 0) * Number(ao.quantity || 1) * Number(it.quantity || 1)), 0);
        return s + prodTotal + addOnsTotal;
    }, 0);
    const salesTax = +(subtotal * 0.05).toFixed(2);
    const shipping = 0.00;
    const total = +(subtotal + salesTax + shipping).toFixed(2);
    const receiptDate = (order.createdAt && new Date(order.createdAt)).toLocaleDateString() || new Date().toLocaleDateString();

    const html = `<!doctype html>
        <html>
            <head>
                <meta charset="utf-8">
                <title>Order Receipt - ${order._id}</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #222; margin: 0; padding: 40px; }
                    .container { max-width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 40px; }
                    .header { display:flex; justify-content:space-between; align-items:center; }
                    .company { font-weight:700; }
                    .upload-btn { border:1px solid #d7e3f0; padding:10px 16px; border-radius:6px; color:#2b6cb0; background:#fff; }
                    .title { text-align:center; font-size:32px; letter-spacing:4px; color:#1e4a86; margin:30px 0; }
                    .two-col { display:flex; justify-content:space-between; }
                    .bill, .meta { width:48%; }
                    table.items { width:100%; border-collapse:collapse; margin-top:20px; }
                    table.items th { background:#0b60a9; color:#fff; padding:10px; text-align:left; }
                    table.items td { padding:10px; border-bottom:1px solid #eee; }
                    .right { text-align:right; }
                    .totals { margin-top:20px; width: 300px; float:right; }
                    .totals table { width:100%; }
                    .totals td { padding:6px 8px; }
                    .totals .label { color:#666; }
                    .totals .amount { text-align:right; font-weight:700; }
                    .notes { clear:both; margin-top:40px; color:#555; font-size:13px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div>
                            <div class="company">Your Company Inc.</div>
                            <div style="font-size:12px;color:#666">1234 Company St,<br/>Company Town, ST 12345</div>
                        </div>
                        <div><button class="upload-btn">Upload Logo</button></div>
                    </div>

                    <div class="title">ORDER RECEIPT</div>

                    <div class="two-col">
                        <div class="bill">
                            <strong>Billed To</strong>
                            <div style="margin-top:8px">${order.user?.name || order.recipientName || 'Customer Name'}</div>
                            <div style="font-size:12px;color:#666;margin-top:6px">${order.address || ''}</div>
                        </div>
                        <div class="meta">
                            <div style="text-align:right"><strong>Receipt #</strong><br/>${order._id}</div>
                            <div style="text-align:right;margin-top:12px"><strong>Receipt date</strong><br/>${receiptDate}</div>
                        </div>
                    </div>

                    <table class="items">
                        <thead>
                            <tr>
                                <th style="width:60px">QTY</th>
                                <th>Description</th>
                                <th style="width:140px" class="right">Unit Price</th>
                                <th style="width:140px" class="right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ (order.items || []).map(i => {
                                const name = (i.product && (i.product.name || i.product.title)) || 'Item';
                                const qty = Number(i.quantity || 0);
                                const unit = Number(i.price || 0);
                                const amount = +(qty * unit).toFixed(2);
                                let rows = `<tr>
                                    <td>${qty}</td>
                                    <td>${name}</td>
                                    <td class="right">${formatCurrency(unit)}</td>
                                    <td class="right">${formatCurrency(amount)}</td>
                                </tr>`;
                                (i.addOns || []).forEach(ao => {
                                    const aoQty = Number(ao.quantity || 1) * Number(qty || 1);
                                    const aoUnit = Number(ao.price || 0);
                                    const aoAmount = +(aoQty * aoUnit).toFixed(2);
                                    const aoLabel = (ao.addOn && ((typeof ao.addOn === 'object') ? (ao.addOn.name || ao.addOn._id) : ao.addOn)) || 'Add-on';
                                    const aoName = ao.customMessage ? `${aoLabel} (${ao.customMessage})` : `${aoLabel}`;
                                    rows += `<tr>
                                        <td>${aoQty}</td>
                                        <td style="padding-left:18px; font-size:0.95em; color:#444">+ ${aoName}</td>
                                        <td class="right">${formatCurrency(aoUnit)}</td>
                                        <td class="right">${formatCurrency(aoAmount)}</td>
                                    </tr>`;
                                });
                                return rows;
                            }).join('') }
                            <tr>
                                <td colspan="4" style="border-top:1px solid #e6eef8"></td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="totals">
                        <table>
                            <tr>
                                <td class="label">Subtotal</td>
                                <td class="amount">${formatCurrency(subtotal)}</td>
                            </tr>
                            <tr>
                                <td class="label">Sales Tax (5%)</td>
                                <td class="amount">${formatCurrency(salesTax)}</td>
                            </tr>
                            <tr>
                                <td class="label">Shipping</td>
                                <td class="amount">${formatCurrency(shipping)}</td>
                            </tr>
                            <tr style="border-top:2px solid #0b60a9">
                                <td class="label"><strong>Total (USD)</strong></td>
                                <td class="amount">${formatCurrency(total)}</td>
                            </tr>
                        </table>
                    </div>

                    <div class="notes">
                        <strong>Notes</strong>
                        <p>Thank you for your purchase! All sales are final after 30 days. Please retain this receipt for warranty or exchange purposes.</p>
                        <p>For questions or support, contact us at support@example.com or (555) 987-6543.</p>
                    </div>
                </div>
            </body>
        </html>`;
    return html;
};

const generateReceiptPdf = async (order) => {
    if (!pdfkitAvailable) {
        // Skip PDF creation if module isn't available
        console.warn('[generateReceiptPdf] pdfkit not installed, skipping PDF generation for order', order._id);
        return false;
    }
    const dir = await ensureUploadsDir();
    if (!dir) {
        console.warn('[generateReceiptPdf] public uploads dir is not available. Skipping PDF receipt generation.');
        return null;
    }
    const receiptFilename = `receipt_${order._id}.pdf`;
    const receiptPath = `/uploads/receipts/${receiptFilename}`;
    const filePath = path.join(dir, receiptFilename);
    try {
        return await new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);
            doc.fontSize(18).text('Receipt', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Order ID: ${order._id}`);
        doc.text(`User: ${order.user?.name || ''} ${order.user?.email || ''}`);
        doc.text(`Created: ${order.createdAt}`);
        doc.moveDown();
        doc.fontSize(14).text('Items');
        order.items.forEach(i => {
            doc.fontSize(12).text(`${i.product?.name || 'Item'} × ${i.quantity} — ₱${i.price}`);
        });
        doc.moveDown();
        doc.fontSize(14).text(`Total: ₱${order.total}`);
        doc.end();
            stream.on('finish', () => resolve(receiptPath));
            stream.on('error', (err) => reject(err));
        });
    } catch (err) {
        console.error('[generateReceiptPdf] Error creating PDF receipt:', err);
        return null;
    }
};

const sendReceiptEmail = async (toEmail, order, pdfPath) => {
    if (!nodemailerAvailable) {
        console.warn('[sendReceiptEmail] nodemailer module is not installed; skipping email sending');
        return;
    }
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.log('[sendReceiptEmail] SMTP is not configured. Skipping sending receipt email to', toEmail);
        return;
    }
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: (process.env.SMTP_SECURE || 'true') === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    let attachments = [];
    let absolutePath = null;
    if (pdfPath && typeof pdfPath === 'string') {
        try {
            absolutePath = path.join(__dirname, '..', 'public', pdfPath.replace(/^\//, ''));
            if (fs.existsSync(absolutePath)) {
                attachments.push({ filename: path.basename(absolutePath), path: absolutePath });
            } else {
                console.warn('[sendReceiptEmail] Attachment path does not exist:', absolutePath);
            }
        } catch (e) {
            console.warn('[sendReceiptEmail] Could not prepare attachment from', pdfPath, e);
        }
    }
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: toEmail,
            subject: `Receipt for Order ${order._id}`,
            text: `Receipt for your order ${order._id}`,
            html: `<p>Dear ${order.user?.name || ''},</p><p>Your order ${order._id} has been approved. Attached is your receipt.</p>`,
            attachments
        });
    } catch (sendErr) {
        console.error('[sendReceiptEmail] Failed to send email', sendErr);
    }
};

// Admin: update order status (approve/decline)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        console.log(`[updateOrderStatus] user=${req.user?._id} role=${req.user?.role} orderId=${req.params.orderId} requestedStatus=${status}`);
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (!['pending', 'approved', 'declined', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        order.status = status;
        if (status === 'approved') {
            order.approvedBy = req.user._id;
            order.approvedAt = new Date();
            // Save early to avoid race conditions and to keep response snappy
            try {
                await order.save();
            } catch (saveErr) {
                console.error('[updateOrderStatus] Error saving order (before receipt generation):', saveErr);
                return res.status(500).json({ message: 'Failed to save order', error: saveErr.message, stack: saveErr.stack });
            }
            // Fire-and-forget receipt generation so UI isn't blocked by filesystem/email problems
            (async () => {
                try {
                    const freshOrder = await Order.findById(req.params.orderId).populate('items.product').populate('items.addOns.addOn').populate('user', 'name email');
                    if (!freshOrder) {
                        console.warn('[updateOrderStatus] Successful approval but order not found when generating receipt');
                        return;
                    }
                    if (!freshOrder.receipt) {
                        const receiptResult = await generateReceiptHtml(freshOrder);
                        const receiptHtmlUrl = receiptResult?.path || null;
                        const receiptHtmlContent = receiptResult?.html || null;
                        let receiptPdfUrl = null;
                        if (pdfkitAvailable) {
                            receiptPdfUrl = await generateReceiptPdf(freshOrder);
                        }
                        const finalReceipt = receiptPdfUrl || receiptHtmlUrl;
                        if (finalReceipt) {
                            freshOrder.receipt = finalReceipt;
                            await freshOrder.save();
                            console.log('[updateOrderStatus] Receipt attached in background:', finalReceipt);
                        }
                        if (receiptHtmlContent) {
                            freshOrder.receiptHtml = receiptHtmlContent;
                        }
                        if (freshOrder.user?.email) {
                            try {
                                const sendPath = receiptPdfUrl || receiptHtmlUrl;
                                if (sendPath) await sendReceiptEmail(freshOrder.user.email, freshOrder, sendPath);
                            } catch (e) {
                                console.error('[updateOrderStatus] Background email error', e);
                            }
                        }
                    }
                } catch (bgErr) {
                    console.error('[updateOrderStatus] Background receipt generation error:', bgErr);
                }
            })();
        }
        console.log('[updateOrderStatus] Saving order. current receipt:', order.receipt);
        try {
            await order.save();
        } catch (saveErr) {
            console.error('[updateOrderStatus] Error saving order:', saveErr);
            return res.status(500).json({ message: 'Failed to save order', error: saveErr.message });
        }
        res.json(order);
    } catch (err) {
        console.error('[updateOrderStatus] Unexpected error:', err);
        res.status(500).json({ message: 'An unexpected error occurred', error: err.message });
    }
};

// Admin: Upload receipt image and attach to order
exports.uploadReceipt = async (req, res) => {
    try {
        console.log('[uploadReceipt] user=', req.user?._id, 'orderId=', req.params.orderId, 'file=', req.file?.filename);
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        // Store relative path so frontend can request it
        order.receipt = `/uploads/receipts/${req.file.filename}`;
        order.status = 'approved';
        order.approvedBy = req.user._id;
        order.approvedAt = new Date();
        await order.save();
        res.json(order);
    } catch (err) {
        console.error('[uploadReceipt] Error:', err);
        res.status(500).json({ message: 'Failed to upload receipt', error: err.message });
    }
};

// Admin: mark order as completed
exports.markOrderCompleted = async (req, res) => {
    try {
        console.log('[markOrderCompleted] user=', req.user?._id, 'orderId=', req.params.orderId);
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        order.status = 'completed';
        order.completedAt = new Date();
        await order.save();
        res.json(order);
    } catch (err) {
        console.error('[markOrderCompleted] Error:', err);
        res.status(500).json({ message: 'Failed to mark order completed', error: err.message });
    }
};

// Admin or owner of order: return the receipt HTML content (if available) as JSON
exports.getReceiptHtml = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        // Permission: owner or admin
        if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        // If inline HTML exists return it — but if it's the old/simple format, rebuild using the new styled template
        if (order.receiptHtml) {
            try {
                const marker = 'ORDER RECEIPT';
                if (String(order.receiptHtml).includes(marker)) {
                    return res.json({ html: order.receiptHtml });
                }
                // Rebuild using new template when the saved HTML doesn't include our marker
                const populated = await Order.findById(req.params.orderId).populate('items.product').populate('items.addOns.addOn').populate('user', 'name email');
                if (!populated) return res.status(404).json({ message: 'Order not found' });
                const newHtml = buildReceiptHtmlContent(populated);
                populated.receiptHtml = newHtml;
                try { await populated.save(); } catch (e) { console.warn('[getReceiptHtml] failed to persist rebuilt receiptHtml', e); }
                return res.json({ html: newHtml });
            } catch (e) {
                console.warn('[getReceiptHtml] error while rebuilding receiptHtml', e);
                return res.json({ html: order.receiptHtml });
            }
        }

        // Try to read from file if a static html path exists
        if (order.receipt && order.receipt.endsWith('.html')) {
            const filePath = path.join(__dirname, '..', 'public', order.receipt.replace(/^\//, ''));
            if (fs.existsSync(filePath)) {
                const content = await util.promisify(fs.readFile)(filePath, 'utf8');
                // persist inline HTML for faster subsequent loads
                order.receiptHtml = content;
                try { await order.save(); } catch (e) { console.warn('[getReceiptHtml] failed to persist receiptHtml', e); }
                return res.json({ html: content });
            }
        }

        // If we reach here, there is no persisted HTML. Build HTML on-demand from order data and return it.
        try {
            // make sure items and user are populated for template
            const populated = await Order.findById(req.params.orderId).populate('items.product').populate('items.addOns.addOn').populate('user', 'name email');
            if (!populated) return res.status(404).json({ message: 'Order not found' });
            const html = buildReceiptHtmlContent(populated);
            // persist inline HTML so next time it's returned directly
            populated.receiptHtml = html;
            try { await populated.save(); } catch (e) { console.warn('[getReceiptHtml] failed to persist inline receiptHtml', e); }
            return res.json({ html });
        } catch (e) {
            console.error('[getReceiptHtml] failed to build receipt html on demand', e);
            return res.status(404).json({ message: 'Receipt not found', error: e.message });
        }
    } catch (err) {
        console.error('[getReceiptHtml] error:', err);
        return res.status(500).json({ message: 'Failed to retrieve receipt', error: err.message });
    }
};
