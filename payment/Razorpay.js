import dotenv from 'dotenv';
dotenv.config();
import Razorpay from 'razorpay';
import transporter from "../config/emailConfig.js";
const instance = new Razorpay({
    key_id: process.env.payment_key_id,
    key_secret: process.env.payment_key_secret
});

const payment_generated = async (req, res) => {
    const { amount } = req.body;
    const options = {
        amount: amount,
        currency: 'INR',
        receipt: 'receipt#1',
        payment_capture: 0,
    };
    try {
        const response = await instance.orders.create(options); 
        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong!');
    }
}

const payment = async (req, res) => {
    const paymentId = req.params.paymentId;
    const amount = req.body.amount;
    const email_user = req.body.email;

    if (!email_user) {
        return res.status(400).send('Email is required');
    }

    try {
         instance.payments.capture(paymentId, amount);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email_user,
            subject: "Payment Successful",
            text: `Your payment amount: ${(amount/100)} has been successfully processed. Your product will be delivered as soon as possible.`
        };

        console.log('Mail options:', mailOptions);

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).send('Error sending email');
            } else {
                console.log(`Email sent: ${info.response}`);
                res.send({ status: "success", message: "Email sent successfully" });
            }
        });
    } catch (error) {
        console.error('Error capturing payment:', error);
        res.status(500).send('Error capturing payment');
    }
};

const verify=async(res,req)=>{
    const { Razorpay_payment_id, Razorpay_order_id, Razorpay_signature } = req.body;
    const payload = `${Razorpay_order_id}|${Razorpay_payment_id}`;
    try {
      const isValidSignature = Razorpay.validateWebhookSignature(payload, Razorpay_signature);
  
      if (isValidSignature) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.error('Error verifying signature:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
}



const sendEmailPayment=async(req,res)=>{
    const { email } = req.params;
    const { amount } = req.body;  

    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
    }
    const orderHistoryLink = `${process.env.FRONTEND_URL}/orderhistory`;

    const emailTemplate = `
        <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background-color: #ffffff; padding: 20px; border-radius: 12px; box-shadow: 0px 4px 15px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 20px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">🎉 Payment Successful!</h1>
            </div>
            
            <!-- Body -->
            <div style="padding: 25px; background: #F9F9F9; text-align: center;">
                
                <p style="font-size: 18px; color: #333;">Dear Valued Customer,</p>
                
                <p style="font-size: 16px; color: #555;">
                    Your payment of <strong style="color: #4CAF50;">₹${(amount).toFixed(2)}</strong> has been successfully processed! 🎊
                </p>
                
                <p style="font-size: 16px; color: #555;">
                    Your order is confirmed and will be delivered soon. 🚀
                </p>

                <!-- Payment Image -->
                <div style="margin: 20px 0;">
                    <img src="https://cdn-icons-png.flaticon.com/512/1040/1040230.png" alt="Payment Success" width="100" style="max-width: 100px; height: auto;" />
                </div>

                <!-- CTA Button -->
                <div style="margin-top: 20px;">
                    <a href="${orderHistoryLink}" 
                       style="background: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; font-size: 16px; border-radius: 8px; display: inline-block;">
                        📦 Track Your Order
                    </a>
                </div>

                <!-- Customer Support -->
                <p style="margin-top: 25px; font-size: 14px; color: #777;">
                    If you have any questions, feel free to <a href="mailto:mandalshivam962@gmail.com" style="color: #4CAF50; text-decoration: none;">contact our support team</a>.
                </p>
                
            </div>

            <!-- Footer -->
            <div style="background: #2E7D32; color: white; text-align: center; padding: 12px; border-radius: 0 0 12px 12px;">
                <p style="margin: 0; font-size: 14px;">💙 Thank you for shopping with us!</p>
            </div>

        </div>
    `;


    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "🎉 Payment Confirmation - Your Order is on the Way!",
            html: emailTemplate, // Use HTML instead of plain text
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({ error: "Error sending email" });
            }
            console.log(`Email sent: ${info.response}`);
            return res.json({ status: "success", message: "Email sent successfully" });
        });
    } catch (error) {
        console.error("Internal server error:", error);
        return res.status(500).json({ error: "Internal email server error" });
    }

}

export  { payment_generated, payment,verify,sendEmailPayment }; 




// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config();
// import Razorpay from 'razorpay';
// import transporter from "../config/emailConfig.js";
// import fs from 'fs';
// import pdf from 'pdfkit';

// const instance = new Razorpay({
//     key_id: process.env.payment_key_id,
//     key_secret: process.env.payment_key_secret
// });

// const generateInvoice = (paymentId, amount, email_user) => {
//     return new Promise((resolve, reject) => {
//         const doc = new pdf();

//         const invoiceName = `invoice_${paymentId}.pdf`;
//         console.log(`invoice_number:${invoiceName}`);
//         const stream = fs.createWriteStream(invoiceName);
//         console.log(`stream:${stream}`);
//         doc.pipe(stream);

//         doc.fontSize(25).text('Invoice', {
//             align: 'center'
//         });

//         doc.fontSize(14).text(`Payment ID: ${paymentId}`);
//         doc.text(`Amount: ₹${(amount/100).toFixed(2)}`);
//         doc.text(`Email: ${email_user}`);
//         doc.text(`Date: ${new Date().toLocaleDateString()}`);

//         doc.end();

//         stream.on('finish', () => {
//             console.log('Invoice generated successfully:', invoiceName);
//             resolve(invoiceName);
//         });
        

//         stream.on('error', (error) => {
//             reject(error);
//         });
//     });
// };

// const payment_generated = async (req, res) => {
//     const { amount } = req.body;
//     const options = {
//         amount: amount,
//         currency: 'INR',
//         receipt: 'receipt#1',
//         payment_capture: 0,
//     };
//     try {
//         const response = await instance.orders.create(options); 
//         res.json(response);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Something went wrong!');
//     }
// }

// const payment = async (req, res) => {
//     const paymentId = req.params.paymentId;
//     const amount = req.body.amount;
//     const email_user = req.body.email;
    
//     if (!email_user) {
//         return res.status(400).send('Email is required');
//     }

//     try {
//          instance.payments.capture(paymentId, amount);
//         const invoiceName = await generateInvoice(paymentId, amount, email_user);
//         console.log(`invoice_payment${invoiceName}`)
//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email_user,
//             subject: "Payment Successful",
//             text: `Your payment amount: ₹${(amount/100).toFixed(2)} has been successfully processed. Your product will be delivered as soon as possible.`,
//             attachments: [{
//                 filename: invoiceName,
//                 path: path.join(__dirname, invoiceName) // Use path module to resolve file path
//             }]
//         };

//         console.log('Mail options:', mailOptions);

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.error('Error sending email:', error);
//                 res.status(500).send('Error sending email');
//             } else {
//                 console.log(`Email sent: ${info.response}`);
//                 res.send({ status: "success", message: "Email sent successfully" });
//             }
//         });
//     } catch (error) {
//         console.error('Error capturing payment:', error);
//         res.status(500).send('Error capturing payment');
//     }
// };

// const verify=async(res,req)=>{
//     const { Razorpay_payment_id, Razorpay_order_id, Razorpay_signature } = req.body;
//     const payload = `${Razorpay_order_id}|${Razorpay_payment_id}`;
//     try {
//       const isValidSignature = Razorpay.validateWebhookSignature(payload, Razorpay_signature);
  
//       if (isValidSignature) {
//         res.json({ success: true });
//       } else {
//         res.json({ success: false });
//       }
//     } catch (error) {
//       console.error('Error verifying signature:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
// };

// export { payment_generated, payment, verify,generateInvoice };
