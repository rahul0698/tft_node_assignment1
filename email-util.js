var nodeMailer = require ('nodemailer');
var config = require('./config');


var transporter  = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.emailConfig.userId,
        pass: config.emailConfig.password
    }
});

exports.sendEmail = (urlWithToken, recepient) => {
    const mailOptions = {
        from: 'bunny1292@gmail.com',
        to: recepient,
        subject: 'Verify you email.',
        html: '<h3>Welcome to this cool api assignment!</h3><p>Please click on the given link to verify the mail. </p><a href="'+urlWithToken+'">Link</a>'
    }

    transporter.sendMail(mailOptions, function(err, info) {
        if(err) console.log(err)
        else console.log(info);
    })
}