const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const router = require('./routes');
const morgan = require('morgan');

// Express 프레임워크를 시작하는 부분
const app = express();

// 보안+요청Parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

// var router1 = require('./routes')(app, Image)
//var Image = require('./models/image');

// 포트 설정하는 부분
const port = process.env.PORT || 80;

// API를 route하는 부분
app.use('/api', router);

// DB를 연결하는 부분
const url = "mongodb://localhost:27017"
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    // CONNECTED TO MONGODB SERVER
    console.log("Connected to mongod server");
});
// 실제로 연결되는 곳.
mongoose.connect(url);

// 서버를 시작하는 부분
app.listen(80, ()=>{
    console.log("Listening on port 80")
})