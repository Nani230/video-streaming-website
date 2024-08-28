const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const fs = require('fs');

const userModel = require('./models/userModel');
const videoModel = require('./models/videoModel');
const userVideoModel = require('./models/userVideoModel');
const verifyToken = require('./verifyToken');

mongoose
    .connect('mongodb://localhost:27017/netflix')
    .then(() => console.log('mongodb connected!!!'))
    .catch((err) => console.log(err));

const app = express();
app.use(cors());
app.use(express.json());

app.post('/createUser', async (req, res) => {
    let userData = req.body;
    console.log(userData)


    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(userData.password, salt).catch((err)=>{console.log(err)});

    userData.password = hashedpassword;

    const users = await new userModel(userData);

    users
        .save()
        .then(() => {
            res.status(201).send({ message: 'User created!!!', success: true });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send({
                massage: 'Unable to create user',
                success: false,
            });
        });
});

app.post('/loginUser', async (req, res) => {
    let userCred = req.body;
    console.log(userCred)

    const user = await userModel.findOne({ username : userCred.username });

    if (user == null) {
        res.status(403).send({
            massage: 'Unable to find user',
            success: false,
        });
    } else {
        const passwordStatus = await bcrypt.compare(
            userCred.password,
            user.password,
        );

        if (passwordStatus) {
            const token = await jwt.sign(userCred, 'random369');

            res.send({
                user,
                token,
                message: 'Welcome User!',
                success: true,
            });
        } else if (!passwordStatus) {
            res.status(401).send({
                message: 'incorrect password',
                success: false,
            });
        }
    }
});

app.get('/videos', verifyToken, async (req, res) => {
    const videos = await videoModel.find();
    res.send(videos);
});

app.get('/videos/:videoid/:userid', verifyToken, async (req, res) => {
    let videoid = req.params.videoid;
    let userid = req.params.userid

    let check = await userVideoModel.findOne({user:userid,video:videoid})

    if(check===null){
        let userobj = new userVideoModel({user:userid,video:videoid})

        userobj.save()
        .then(async()=>{
            const video = await videoModel.findOne({ _id:videoid });
            res.send(video);

        })
        .catch((err)=>conmsole.log(err))
    }
    else{
        const video = await videoModel.findOne({ _id:videoid });
        let videodata = {...video}._doc;
        console.log(videodata)
        let vd=  videodata.currentTime = check.currentTime
        console.log(vd)
        res.send(videodata);

    }
});


app.put('/trackTime/:userid/:videoid', (req, res) => {
    let user = req.params.userid;
    let video = req.params.videoid;

    let data = req.body;

    userVideoModel
        .updateOne({ user, video }, data)
        .then(() => res.send({ massage: 'Timing updates', success: true }))
        .catch((err) => {
            console.log(err);
            res.send({ massage: 'Something went worng!', success: false });
        });
});

app.get('/stream/:filename', async (req, res) => {
    const range = req.headers.range;

    if (!range) {
        res.status(400).send({ massage: 'Invalid Range header!' });
    }

    let filepath = "./videos/"+req.params.filename;
    
    const videoSize = fs.statSync(filepath).size;

    const start = Number(range.replace(/\D/g,''));
    const end = Number(Math.min(start + 10 ** 6, videoSize - 1));
    const contentLength = end - start + 1;

    let headers = {
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Content-Type': 'video/mp4',
    };
  
    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(filepath, { start, end });

    videoStream.pipe(res);
});

app.listen(8000, () => console.log('Server is running at port number 8000'));
