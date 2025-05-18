const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express().use(bodyParser.json());

const VERIFY_TOKEN = "545443"; // ← تأكد أنه يطابق ما أدخلته في إعدادات فيسبوك
const PAGE_ACCESS_TOKEN = "EAAOyf5Kp6l8BO0X5MU6ZAifeIuB1au7gty0AJZA51FqT1Rc7n9i5fYMvdThtsZB6MZAspd0teaixtEgq8rapjU2xt4RlZBEH8THSaNZCN3kqYUAUPGYeVlvQRjui9cc6l89phk6Dt6aDBxmPVpdBVMWO4NhaAqjq3UZBZAEUghHJxzqkHi9yUzmDqehBurPsI7hsifGILNBxNPNlAfNIZCwZDZD"; // ← ضع التوكن الخاص بصفحة فيسبوك هنا

// للتحقق من صحة Webhook
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log("✅ Webhook verified");
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// استقبال الرسائل والرد عليها
app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            const webhook_event = entry.messaging[0];
            const sender_psid = webhook_event.sender.id;

            if (webhook_event.message && webhook_event.message.text) {
                const message_text = webhook_event.message.text.toLowerCase();
                let response;

                if (message_text.includes("مرحبا")) {
                    response = { text: "أهلاً بك! كيف يمكنني مساعدتك؟ 😊" };
                } else if (message_text.includes("السلام عليكم")) {
                    response = { text: "وعليكم السلام ورحمة الله. تفضل 🌟" };
                } else if (message_text.includes("شكرا")) {
                    response = { text: "يسرني مساعدتك! 🌷" };
                } else {
                    response = { text: "عذرًا، لم أفهم رسالتك. هل يمكنك إعادة صياغتها؟ 🤔" };
                }

                callSendAPI(sender_psid, response);
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// دالة إرسال الرد إلى فيسبوك
function callSendAPI(sender_psid, response) {
    const request_body = {
        recipient: { id: sender_psid },
        message: response
    };

    request({
        uri: "https://graph.facebook.com/v17.0/me/messages",
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: "POST",
        json: request_body
    }, (err, res, body) => {
        if (!err) {
            console.log("✅ رسالة أُرسلت بنجاح");
        } else {
            console.error("❌ فشل إرسال الرسالة:", err);
        }
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 App running on port ${PORT}`));
