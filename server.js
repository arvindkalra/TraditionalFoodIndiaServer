/**
 * Created by arvind on 17/10/17.
 */
const express = require('express');
const app = express();
const fs = require('fs');
const port = 3000 || process.env.PORT;
const bodyParser = require('body-parser');
const mongo = require('./mongoconnect.js');
const path = require('path');

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname,'hbs'));
app.use(express.static(__dirname + '/hbs'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.post('/new/user', (req, res) => {
    console.log("post /new/user");
    var user = req.body.name;
    console.log(user);
    mongo.makeNewUser(user, function () {
        res.send(null);
   })
});

app.get('/search', (req, res) => {
   console.log("get /search");
   var dish = req.query.dish;
   mongo.searchForDishName(dish, function (result) {
       res.send(result);
   })
});

app.get('/post', (req, res) => {
   var id = req.query.id;
   var dish = req.query.dish;
   var kiski = req.query.kiski;
   console.log(kiski);
   mongo.getObjectfromIdandDish(id, dish, function (result, state) {
       var ylink = result.video;
       var nylink = ylink.substr(32);
       var string = "https://www.youtube.com/embed/" + nylink;
       mongo.isLiked(id, kiski, function (boolean) {
            res.render('Post', {
                comment : result.comments,
                description : result.description,
                kiski : kiski,
                id : id,
                dishname: dish,
                state : state,
                numlikes: result.likes,
                ylink: string,
                val: result.username,
                like: boolean
           });
       });
   });
});

app.get('/postApproval', (req, res) => {
    var id = req.query.id;
    var dish = req.query.dish;
    mongo.getObjectfromIdandDishUnapproved(id, dish, function (result) {
        var ylink = result.video;
        var nylink = ylink.substr(32);
        var string = "https://www.youtube.com/embed/" + nylink;
        res.render('Post', {
            description : result.description,
            id : id,
            dishname: dish,
            numlikes: result.likes,
            ylink: string,
            val: result.username
        });
    });
});

app.get('/getProfile', (req, res) => {
    console.log("get /getProfile");
    var user = req.query.username;
    console.log(user);
    mongo.getProfileDetails(user, function (answer) {
        console.log(answer);
        res.send(answer);
    })
});

app.get('/add/regionList', (req, res) => {
    console.log("get /add/regionList");
    mongo.getRegionList(function (result) {
        console.log("*************");
        res.send(result);
    })
});

app.get('/add/stateList', (req, res) => {
    console.log("get /add/stateList");
    mongo.getStateList(req.query, function (result) {
        console.log("*************");
        res.send(result);
    })
});

app.get('/add/dishList', (req, res) => {
    console.log("get /add/dishList");
    mongo.getDishList(req.query, function (result) {
        console.log("*************");
        res.send(result);
    });
});

app.post('/add/other', (req, res) => {
   console.log("post /add/other");
   mongo.addToOther(req.body, function () {
       console.log("***********");
       res.send({id : true});
   })
});

app.get('/superuser', (req, res) => {
   res.sendFile(path.join(__dirname, '/html/Approval.html'));
});

app.post('/add', (req, res) => {
   console.log("post /add");
   mongo.addNewPostToUnapproved(req.body, function () {
       console.log("*************");
       res.send({id : true});
   });
});

app.get('/getUnapproved', (req, res) => {
   console.log("get /getUnapproved");
   mongo.getUnapproved(function (result) {
       res.send(result);
   })
});

app.post('/approve', (req, res) => {
    console.log("post /approve");
    var id = req.body.id;
    var dish = req.body.dish;
    mongo.approveDish(id, dish, function () {
        res.send(true);
    });
});

app.post('/disapprove', (req, res) => {
    var id = req.body.id;
    mongo.disApproveDish(id, function () {
        res.send(true);
    })
});

app.post('/like/add', (req, res) => {
   var username = req.body.username;
   var dish = req.body.dish;
   var id = req.body.id;
   var kiska = req.body.kiska;
   var likes = req.body.likes;
   mongo.addLike(id,dish,likes,function () {
      mongo.addLikeToUser(username, id, dish, kiska, function () {
          res.send(true);
      })
   });
});

app.post('/like/remove', (req, res) => {
    var username = req.body.username;
    var dish = req.body.dish;
    var id = req.body.id;
    var kiska = req.body.kiska;
    var likes = req.body.likes;
    mongo.addLike(id, dish, likes, function () {
        mongo.removeLikeFromUser(id, kiska, function () {
            res.send(true);
        })
    })
});

app.post('/comment/add', (req, res) => {
    console.log("post /comment/add");
    mongo.addComment(req.body, function () {
        res.send("");
    })
});

app.listen(port, () => {
    mongo.connectDB(function () {
        console.log("Server Running on Port " + port);
    });
});