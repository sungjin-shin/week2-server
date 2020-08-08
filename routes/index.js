var express = require('express');
const User = require('../models/member');
const contact = require('../models/contact');
const booking = require('../models/booking');
const imageSchema = require('../models/image')

//const e = require('express');
var router = express.Router();

///////////////누나 부분///////////////
var multer, storage, path, crypto;
var fs = require('fs'); // 파일을 복사하거나 디렉토리 복사하는 모듈

//이미지 스키마 변수
//var imageSchema = require('../models/image')
multer = require('multer')
path = require('path');
crypto = require('crypto');

//데이터베이스 내의 데이터를 csv로 저장하기 위한 변수
const mongodb = require("mongodb").MongoClient;
//const createCsvWriter = require("csv-writer").createObjectCsvWriter;


// [ANDROID TO SERVER AND THEN DATABASE]
     //서버에 이미지를 저장할 디렉토리 설정
     storage = multer.diskStorage({
      destination: './uploads/',
      filename: function(req, file, cb) {
        return crypto.pseudoRandomBytes(16, function(err, raw) {
          if (err) {
            return cb(err);
          }
          return cb(null, "" + (raw.toString('hex')) + (path.extname(file.originalname)));
        });
      }
    });

  //CREATE IMAGE : 안드로이드에서 촬영한 사진을 서버로 전송
  router.post(
      '/upload',
      multer({
          storage: storage
      }).single('upload'), function(req,res){ 
          console.log(req.file);
          console.log(req.body);
          res.redirect("/uploads/" + req.file.filename);
          console.log(req.file.filename);

          //SAVE IMAGE INFO INTO DATABASE
          var image = new imageSchema({
              name:req.file.filename,
              filepath:req.file.path
          });

      image.save(function(err){
          if(err){
              console.error(err);
              return;
          }
      });
      return res.status(200).end();

  });


  //서버의 'uploads' 디렉토리 내부에 이미지 저장
  router.get('/uploads/:upload', function (req, res){
      file = req.params.upload;
      console.log(req.params.upload);
      var img = fs.readFileSync("/root/onlyDialog/uploads/" + file);
      res.writeHead(200, {'Content-Type': 'image/png' });
      res.end(img, 'binary');

  });

  //[DATABASE TO SERVER]
  // GET ALL IMAGES
  router.get('/', function(req,res){

      imageSchema.find(function(error, datas){
          var resultData = "";

          if(!error && (datas!= null)){
              resultData = datas
              console.log(resultData)
          }
          return res.status(200)
          .send({data:resultData})

      })

  });

  // GET SINGLE IMAGE
  router.get('images/:name', function(req, res){
      imageSchema.findOne({_id: req.params.name}, function(err, image){
          if(err) return res.status(500).json({error: err});
          if(!image) return res.status(404).json({error: 'image not found'});
          res.json(image);
      })
  });

  //[EDIT DATABASE DATA]
  // UPDATE THE IMAGE
  router.put('/api/images/:image_name', function(req, res){
      //find image using 'name'
      imageSchema.findById(req.params.image_name, function(err, image){ 
          if(err) return res.status(500).json({ error: 'database failure' });
          if(!image) return res.status(404).json({ error: 'image not found' });

          if(req.body.name) image.name = req.body.name;
          if(req.body.filepath) image.filepath = req.body.filepath;

          //update
          image.save(function(err){
              if(err) res.status(500).json({error: 'failed to update'});
              res.json({message: 'image updated'});
          });

      });
  });

  // DELETE IMAGE
  router.delete('/api/images/:image_name', function(req, res){
      imageSchema.remove({ _id: req.params.image_name }, function(err, output){
          if(err) return res.status(500).json({ error: "database failure" });

          /* ( SINCE DELETE OPERATION IS IDEMPOTENT, NO NEED TO SPECIFY )
          if(!output.result.n) return res.status(404).json({ error: "book not found" });
          res.json({ message: "book deleted" });
          */

          res.status(204).end();
      })
  });


// module.exports = function(app, Image) //Image모델 사용
// {
    

// }





///////////////누나 부분///////////////






// 192.249.19.243:8980/api/
router.get('/', function(req, res, next) {
  return res.send("Hello World");
});

// 192.249.19.243:8980/api/signup
// 첫 로그인 할때 이름, 이메일, 패스워드 입력하여 사용자 등록
router.post('/signup', (req, res)=>{
  const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
  })

  const init = new contact({email: req.body.email})

  newUser.save((err, users)=>{
    // email에 unique: true를 설정하여 동일한 email은 등록 안되도록
    if(err){
      console.error(err);
      return res.status(400).json({msg:'Error 발생'});
    }
    else{

      init.save((err, contacts)=>{
        if(err){
          console.error(err);
          return res.status(404).json({msg:'저장안됨'});
        }
        else{
          console.log('member initiation success');
          return res.status(200).json({msg:'저장잘됨'});
        }
      })
    }
  });
});

// 192.249.19.243:8980/api/login
// 이미 등록되어 있는 사용자의 로그인
router.post('/login', (req, res)=>{
  //req.params.email

  const query1 ={
    email: req.body.email
  }

  const query2 ={
    email: req.body.email,
    password: req.body.password
  }

  // const query = {email: newUser.email}
  if (req.body.email == "admin"){
    return res.status(500).json({msg: 'admin login!'})
  }
  User.findOne(query1, (err, result1)=>{
    if(err){
      console.error(err);
      console.log('login fail');
      return res.status(404).json({msg: 'Login 실패'})
    }
    else if(result1 == null){
      console.log('Not registered email');
      return res.status(300).send()
    }
    else{
      User.findOne(query2, (err, result2)=>{
        if(err){
          console.error(err);
          console.log('login fail');
          return res.status(404).json({msg: 'Login 실패'})
        }
        else if(result2 == null){
          console.log('Wrong password')
          return res.status(400).send()
        }
        else{
          console.log('login success')
          // 성공할 시 status 200을 보내서 "다음 intent로 넘어가!!"라는 신호를 보냄
          return res.status(200).json({result2})
        }
      })
    }
    // else if(result == null){
    //   console.log('No data')
    //   return res.status(400).send()
    // }
    // else{
    //   console.log('login success')
    //   // 성공할 시 status 200을 보내서 "다음 intent로 넘어가!!"라는 신호를 보냄
    //   return res.status(200).json(result)
    // }
  })
})

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 이 이후부터는 name, password 접근할 필요가 없다. 모두 안드로이드에서 intent로 넘겨준 email로만 접근할거임///////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 192.249.19.243:8980/api/contact/init
// intent로 인해 fragment로 넘어갔을 때 전체 dialog를 보내주는 api
router.post('/contact/init', (req, res)=>{
  
  contact.findOne({email: req.body.email}, {contactList: true, _id: false}, (err, contacts) => {

    if(err){
      console.log("fail")
      console.error(err);
      return res.status(404).json({msg:'Error 발생'});
    }
    
    else{
      console.log("success sending contact data")
      return res.status(200).json(contacts);
    }
  });
  
})


// 192.249.19.243:8980/api/contact/add
// contactList에 연락처를 추가하는 api
router.post('/contact/add', (req, res)=>{
  const newContact = {
    nameContact: req.body.nameContact,
    phoneNum: req.body.phoneNum
  };
  console.log('이거슨시작');
  console.log(newContact);

  contact.findOne({email: req.body.email}, (err, user) => {
    if(err){
      console.log("fail to find user contact data")
      console.error(err);
      return res.status(404).json({msg:'Error 발생'});
    }
    else{
      user.contactList.push(newContact);

      user.save((err)=>{
        if(err) return res.status(404).json({msg:'Error 발생'});
        var contact = user.contactList
        return res.status(200).json({contact});
      });
    }
  });

});

// 192.249.19.243:8980/api/contact/remove
// contactList에 특정 연락처를 제거하는 api
router.post('/contact/remove', (req, res)=>{
  
  contact.findOne({email: req.body.email}, (err, contacts) => {

    if(err){
      console.log("fail")
      console.error(err);
      return res.status(404).json({msg:'Error 발생'});
    }
    
    else if (contacts == null){
      console.log("Email error... is that possible?")
      return res.status(400).json(contacts);
    }

    else{
      console.log(req.body.removeID)
      var doc = contacts.contactList.id(req.body.removeID)
      console.log(doc)

      // doc에는 찾고자 하는 ID가 있는지 여부가 들어있음
      // doc이 null이라면 찾고자하는 ID가 없는 것이므로 error
      if (doc == null){
        console.log("fail")
        console.error(err);
        return res.status(400).json({"msg":"No ID found!"});
      }


      // doc이 null이 아니면 찾는 연락처가 있으므로 그것을 제거
      else{
        contacts.contactList.id(req.body.removeID).remove()
        contacts.save(function (err){
          if (err) return res.status(404).json({"msg": "remove fail"});
          return res.status(200).json({"msg": "remove success"})
        })
      }
    }
  });
  
})




////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////여기부터는 숙박 어플에 대한 api들임///////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 192.249.19.243:8980/api/booking/register
// 숙소 사장이 새로운 숙소를 등록하기 위한 api
router.post('/booking/register', (req, res)=>{
  const newHotel = new booking({
    hotelName: req.body.hotelName,
    loc: req.body.loc,
    lati: req.body.lati,
    longi: req.body.longi
  });

  console.log(newHotel);

  newHotel.save((err, users)=>{
    // email에 unique: true를 설정하여 동일한 email은 등록 안되도록
    if(err){
      console.error(err);
      return res.status(400).json({msg:'Error 발생'});
    }else{
      console.log("New hotel register success")
      return res.status(200).json({msg:'저장잘됨'});
    }
  });
});

// 192.249.19.243:8980/api/booking/book --> 안드로이드 쪽에서 구현 완료
// 새로운 예약을 하기 위한 api
router.post('/booking/book', (req, res)=>{
  const searchHotel = {
    hotelName: req.body.hotelName,
    loc: req.body.loc
  }
  const reservInfo = {
    email: req.body.email,
    checkIn: req.body.checkIn,
    checkOut: req.body.checkOut
  }
  console.log('이거슨시작');
  console.log(searchHotel);

  booking.findOne(searchHotel, (err, hotel)=>{
    if(err){
      console.error(err);
      return res.status(400).json({msg:'Error 발생'});
    }
    else if(hotel == null){
      console.log("No Hotel Found")
    }
    else{
      hotel.reservList.push(reservInfo);  

      hotel.save((err)=>{
        if(err) return res.status(404).json({msg:'Error 발생'});
        var reserv = hotel.reservList
        return res.status(200).json({reserv});
      })
    }
  })
})


// 192.249.19.243:8980/api/booking/cancel
// 이미 되어있는 예약을 취소하기 위한 api
router.post('/booking/cancel', (req, res)=>{
  const searchHotel = {
    hotelName: req.body.hotelName,
    loc: req.body.loc
  };
  const reservInfo = {
    removeID: req.body.removeID,
    // checkIn: req.body.checkIn,
    // checkOut: req.body.checkOut
  }

  booking.findOne(searchHotel, (err, hotel) => {

    if(err){
      console.log("fail")
      console.error(err);
      return res.status(404).json({msg:'Error 발생'});
    }
    
    else if (hotel == null){
      console.log("Email error... is that possible?")
      return res.status(400).json(hotel);
    }

    else{
      //console.log(req.body.email)
      var doc = hotel.reservList.id(req.body.removeID)
      console.log(doc)

      // doc에는 찾고자 하는 ID가 있는지 여부가 들어있음
      // doc이 null이라면 찾고자하는 ID가 없는 것이므로 error
      if (doc == null){
        console.log("fail")
        console.error(err);
        return res.status(400).json({"msg":"No ID found!"});
      }


      // doc이 null이 아니면 찾는 연락처가 있으므로 그것을 제거
      else{
        hotel.reservList.id(req.body.removeID).remove()
        hotel.save(function (err){
          if (err) return res.status(404).json({"msg": "remove fail"});
          return res.status(200).json({"msg": "remove success"})
        })
      }
    }
  });
});

// 192.249.19.243:8980/api/booking/getHotelList --> 구현 완료!
// 입력받은 지역에 대한 숙소 리스트 모두 불러오기
router.post('/booking/getHotelList', (req, res)=>{
  const searchHotel = {
    loc: req.body.loc
  }

  booking.find(searchHotel, (err, hotelList)=>{
    if(err){
      console.log("fail")
      console.error(err);
      return res.status(404).json({msg:'숙소 예약 내역 조회 실패'});
    }
    else if(hotelList == null){
      console.log("등록되지 않은 숙소")
      return res.status(400).json({msg:'등록되지 않은 숙소'})
    }
    else{
      console.log("해당 지역 숙소 찾기 성공")
      return res.status(200).json({hotelList})
    }
  })
})

// 192.249.19.243:8980/api/booking/getBookList
// 예약한 숙소 리스트 모두 불러오기
router.post('/booking/getBookList', (req, res)=>{
  // const searchHotel = {
  //   email: req.body.email,
  //   loc: req.body.loc
  // }

  booking.find((err, hotelList)=>{
    if(err){
      console.log("fail")
      console.error(err);
      return res.status(404).json({msg:'숙소 예약 내역 조회 실패'});
    }
    else if(hotelList == null){
      console.log("등록되지 않은 숙소")
      return res.status(400).json({msg:'등록되지 않은 숙소'})
    }
    else{
      console.log("해당 지역 숙소 찾기 성공")
      return res.status(200).json({hotelList})
    }
  })
})

module.exports = router;