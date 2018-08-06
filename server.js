const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const emailUtil = require('./email-util');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const config = require('./config');
const  User = require('./models/user');

app.set('superSecret', config.secret);

mongoose.connect(config.database);


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.listen(3000, () => {
    console.log('App listening on port 3000');
})

app.post('/signup', (req,res)=> {
    let recepient = req.body.emailId;
    let token = jwt.sign(recepient, app.get('superSecret'));
    let urlWithToken = 'http://'+req.get('host')+'/verify?token='+token;
    let data = req.body;
     var user = new User({
        emailId: data.email,
        password: data.password,
        isActive: false,
        token: token
    });
    user.save((err) => {
        if(err) return console.log(err);
        try {
            emailUtil.sendEmail(urlWithToken, recepient);
            res.json({success: true});
        } catch(e) {
            console.log(e);
        }
    })
});

app.get('/verify', (req, res)=> {
    User.find({token:req.query.token}, (err, user)=> {
        if(err) console.log(err);
        if(!user) {
            console.log('User not found');
        }else {
            User.update({emailId: user.email}, {isActive: true, token:''}, function(err) {
                if(err) console.log(err);
                res.json({success: true, message: 'Email Verified'});
            })
        }
    })
});

app.post('/authenticate', (req, res) => {
    console.log(req.body);
    User.findOne({emailId: req.body.emailId}, function(err, user) {
        if (err) console.log(err)

        if(!user) {
            res.json({success: false, message: 'Authenticate failed. User does not exist'})
        } else if(user){
            if(user.password != req.body.password){
                res.json({success: false, messsage: 'Authenticate failed. Password not correct'});
            } else {
                const payload = {
                    isActive: user.isActive
                };
                var token = jwt.sign(payload, app.get('superSecret'), {
                    expiresIn: 86400 //24 hours
                });

                res.json({
                    success: true,
                    message: 'User Authenticated',
                    token: token
                });
            }
        }
    })
})

app.use((req, res, next)=> {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if(token) {
        jwt.verify(token, app.get('superSecret'), (err, decoded) => {
            if(err) {
                return res.json({success: false, message: 'Failed to authenticate'});
            } else {
                res.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({success: false,
        message: 'No token provided.'});
    }
})

app.get('/users', (req,res) => {
    User.find({}, function(err, users) {
        res.json(users);
    });
});

