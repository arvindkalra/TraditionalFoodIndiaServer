
// username = arvkal
// password = wfi123

var db = require('mongodb').MongoClient;

var url = "mongodb://arvkal:wfi123@ds227565.mlab.com:27565/wfihack";
var obj = "";
const initial_Objects_To_Be_Added = [
        {   state : "ASSAMESE",
            posts : []
        },
        {   state : "AWADH",
            posts : []
        },
        {   state : "BENGALI",
            posts : []
        },
        {   state : "BIHARI",
            posts : []
        },
        {   state : "GOA",
            posts : []
        },
        {   state : "GUJRATI",
            posts : []
        },
        {   state : "HYDERABADI",
            posts : []
        },
        {   state : "KASHMIRI",
            posts : []
        },
        {   state : "KERELA",
            posts : []
        },
        {   state : "MARATHI",
            posts : []
        },
        {   state : "ORIYA",
            posts : []
        },
        {   state : "PARSI",
            posts : []
        },
        {   state : "PUNJABI",
            posts : []
        },
        {   state : "RAJASTHANI",
            posts : []
        },
        {   state : "TAMIL",
            posts : []
        },
        {
            name : "comments",
            comments : []
        },
    {
        name : "likes",
        likes : []
    },
    {
        name : "OTHER",
        posts : []
    }
];
// connectDB();

function connectDB(run_server) {
    db.connect(url, function (err, database) {
        if(err){throw err}
        console.log("Connected to Mlabs...");
        obj = database;
        run_server();
    })
}

function makeNewUser(username, callback) {
    console.log("Called For Adding New User to the D.B.");

    obj.collection(username).insertMany(initial_Objects_To_Be_Added, function (err, result) {
        console.log("Initial Objects For New User Added...");
        callback();
    });
}

function addToOther(object, callback){
    console.log(object.region);
    console.log("Called for Adding to Other...");
    var username = object.username;
    var region = object.region;
    var state = object.state;
    var description = object.description;
    var dishName = object.dish_name;
    dishName = dishName.toUpperCase();
    var video = object.video;
    var upvotes = 0;
    var id = new Date().toJSON() + state;
    var todayDate = new Date().toJSON().slice(0,10).split('-').reverse().join('-');
    var objtba = {
        approved : false,
        state : state,
        region : region,
        dishName : dishName,
        id : id,
        date : todayDate,
        description : description,
        username : username,
        video : video,
        comments : [],
        likes : upvotes
    };
    console.log("Object created... Finding Match...");
    obj.collection("OTHER").insertOne(objtba, function (err, result) {
        if(err) throw err;
        console.log("New Dish Added to Other Folder");
        addNewPostToUserOtherObject(username, state, region, dishName, id, callback);
    })
}

function addNewPostToUserOtherObject(username, state, region, dish_name, id, callback) {
    var date = new Date().toJSON().slice(0,10).split('-').reverse().join('-');
    console.log("Called for Adding New Dish to Username Other Object with date = " + date);
    var objtba = {
        approved : false,
        state : state,
        region : region,
        dishName : dish_name,
        date : date,
        id : id
    };
    obj.collection(username).updateOne({name : "OTHER"}, {$push : {posts : objtba}}, function (err, result) {
        if(err) throw err;
        console.log("Added to the UserCollection Other");
        callback();
    })
}

function getDishList(object, callback) {
    var state = object.request;
    console.log("Called for getting dish list..." + state);
    obj.collection("StateRegionList").findOne({name : state}, function (err, result) {
        if(err) throw err;
        if(result === null){
            console.log("Did Not Match");
            callback(false);
            return;
        }
        console.log("Found... Returning it..." + result.list);
        var list  = {list : result.list};
        callback(list);
    })
}

function getStateList(object, callback) {
    var region = object.request;
    console.log("Called for getting state list..." + region);
    obj.collection("StateRegionList").findOne({name : region}, function (err, result) {
        if(err) throw err;
        if(result === null){
            console.log("Did Not Match");
            callback(false);
            return;
        }
        console.log("Found... Returning it..." + result.list);
        var list  = {list : result.list};
        callback(list);
    })
}

function getRegionList(callback) {
    console.log("Called for getting region list...");
    obj.collection("StateRegionList").findOne({name :  "REGIONS"}, function (err, result) {
        if(err) throw err;
        if(result === null){
            console.log("Did Not Match");
            callback(false);
            return;
        }
        var list  = {list : result.list};
        console.log("Found... Returning it..." + result.list);
        callback(list);
    });
}

function addNewPostToUserCollection(username, state, dish_name, id, callback) {
    var date = new Date().toJSON().slice(0,10).split('-').reverse().join('-');
    console.log("Called for Adding New Dish to Username with date = " + date);

    obj.collection(username).updateOne({state : state}, {$push : {posts : {approved : false, dishName : dish_name, date : date, id: id, likes : 0}}}, function (err, result) {
        if(err) throw err;
        console.log("Added to the UserCollection");
        callback();
    });
}

function approveDish(id, dish, callback) {
    obj.collection("UNAPPROVED").findOneAndDelete({id : id}, function (err, result) {
        if(err) throw err;
        var todayDate = new Date().toJSON();
        var objrem = result.value;
        var state = id.substr(24);
        var objtba = {
            id : id,
            date : todayDate,
            description : objrem.description,
            username : objrem.username,
            video : objrem.video,
            comments : [],
            likes : 0,
            approved : true
        };
        addNewPostToDish(state, dish, objtba, callback);
    });
}

function approveDishInUser(username, state, id, callback) {
    obj.collection(username).updateOne({state : state, "posts.id" : id}, {$set : {"posts.$.approved" : true}}, function (err, result) {
        if(err) throw err;
        callback();
    })
}

function addNewPostToDish(state, dishName, object, callback) {
    console.log("Called for Adding New Dish, Opening Object(Approved)");
    var username = object.username;
    var objtba = object;
    var id = object.id;
    console.log("Object created... Finding Match...");
    obj.collection(state).findOne({dish : dishName}, function (err, result) {
        if(result === null){
            console.log("Match Not Found..");
            console.log("Ading New Object");
            var nobj = {
                dish : dishName,
                posts : [
                    objtba
                ]
            };
            obj.collection(state).insertOne(nobj, function (err, result) {
                console.log("New Dish Added");
                approveDishInUser(username,state, id, callback);
            })
        }else{
            console.log("Match Found...");
            console.log("Appending New Object in Array");
            obj.collection(state).updateOne({dish : dishName}, {$push : {posts : objtba}}, function (err, result) {
                console.log("Post Appended");
                approveDishInUser(username,state, id, callback);
            })
        }
    })
}

function getUnapproved(callback) {
    obj.collection("UNAPPROVED").find().toArray(function (err, result) {
        if(err) throw err;
        var arrtbr = [];
        for(var i = 0; i < result.length; i++){
            var dishName = result[i].dish_name;
            var id = result[i].id;
            var state = id.substr(24);
            var objtba = {
                dishName : dishName,
                id : id,
                state : state
            };
            arrtbr.push(objtba);
        }
        callback(arrtbr);
    });
}

function addNewPostToUnapproved(object, callback) {
    console.log(object.region);
    console.log("Called for Adding New Dish, Opening Object(Unapproved)");
    var username = object.username;
    var state = object.state;
    var description = object.description;
    var dishName = object.dish_name;
    var video = object.video;
    var upvotes = 0;
    var id = new Date().toJSON() + state;
    var todayDate = new Date().toJSON().slice(0,10).split('-').reverse().join('-');
    var objtba = {
        dish_name : dishName,
        id : id,
        date : todayDate,
        description : description,
        username : username,
        video : video,
        comments : [],
        likes : upvotes,
        approved : false
    };
    console.log("Object created... Finding Match...(Unapproved)");
    obj.collection("UNAPPROVED").insertOne(objtba, function (err, result) {
        addNewPostToUserCollection(username, state, dishName, id, callback);
    });
}

function addCommentToUser(username, object, callback) {
    obj.collection(username).updateOne({name : "comments"}, {$push : {comments : object}}, function (err, result) {
        if(err) throw err;
        callback();
    });
}

function addComment(object, callback) {
    console.log("Called For Adding Comment...");
    var username = object.username;
    var kiska = object.kiski;
    var id = object.id;
    var idofcomment = new Date().toJSON();
    var comment = object.comment;
    var state = object.state;
    var dish = object.dish_name;
    var objtbaindish = {
        username : kiska,
        id : idofcomment,
        string : comment
    };
    var objtbainuser = {
        dishName : dish,
        username : kiska,
        id : idofcomment,
        string : comment
    };

    obj.collection(state).updateOne({"dish" : dish, "posts.id" : id},{$push : {"posts.$.comments" : objtbaindish}},function (err, result) {
        if(err) throw err;
        console.log("Comment Added in Dish");
        addCommentToUser(username, objtbainuser, function () {
            console.log("Comment Added in User");
            callback();
        })
    })
}

function getProfileDetails(username, callback) {
    obj.collection(username).find().toArray(function (err, result) {
        if (err) throw err;
        var objtbrv = {};
        var dishes = [];
        var comments = [];
        var imagelink = "";

        for (var i = 0; i < result.length; i++) {
            var currobj = result[i];
            var statename = currobj.state;
            var name = currobj.name;

            if (statename && currobj.posts.length != 0) {
                for (var j = 0; j < currobj.posts.length; j++) {
                    if(currobj.posts[j].approved) {
                        var dishname = currobj.posts[j].dishName;
                        var id = currobj.posts[j].id;
                        var likes = currobj.posts[j].likes;
                        var dishobj = {
                            dishname: dishname,
                            id: id,
                            likes: likes
                        };
                        dishes.push(dishobj);
                    }
                }
            } else if (name === "image") {
                imagelink = currobj.link;
            } else if (name === "comments") {
                for (var k = 0; k < currobj.comments.length; k++) {
                    var dish = currobj.comments[k].dishName;
                    var username = currobj.comments[k].username;
                    var id = currobj.comments[k].id;
                    var comment = currobj.comments[k].string;
                    var commentobj = {
                        dishName: dish,
                        username: username,
                        id: id,
                        comment : comment
                    };
                    comments.push(commentobj);
                }
            }
        }

        objtbrv.comments = comments;
        objtbrv.image = imagelink;
        objtbrv.posts = dishes;
        callback(objtbrv);
    });
}

function searchForDishName(dishb, callback) {
    console.log("Called for Search");
    var dish = dishb.toUpperCase();
    obj.collection('ASSAMESE').findOne({dish : dish}, function (err, result){
        console.log("ASSAMESE...");
        if(err) throw err;
        if(result === null){
            obj.collection('AWADH').findOne({dish : dish}, function (err, result) {
                console.log("AWADH...");
                if(err) throw err;
                if(result === null){
                    obj.collection('BENGALI').findOne({dish : dish}, function (err, result) {
                        console.log("BENGALI...");
                        if(err) throw err;
                        if(result === null){
                            obj.collection('BIHARI').findOne({dish : dish}, function (err, result) {
                                console.log("BIHARI...");
                                if(err) throw err;
                                if(result === null){
                                    obj.collection('GOA').findOne({dish : dish}, function (err, result) {
                                        console.log("GOA...");
                                        if(err) throw err;
                                        if(result === null){
                                            obj.collection('GUJRATI').findOne({dish : dish}, function (err, result) {
                                                console.log("GUJRATI...");
                                                if(err) throw err;
                                                if(result === null){
                                                    obj.collection('HYDERABADI').findOne({dish : dish}, function (err, result) {
                                                        console.log("HYDERABADI...");
                                                        if(err) throw err;
                                                        if(result === null){
                                                            obj.collection('KASHMIRI').findOne({dish : dish}, function (err, result) {
                                                                console.log("KASHMIRI...");
                                                                if(err) throw err;
                                                                if(result === null){
                                                                    obj.collection('KERELA').findOne({dish : dish}, function (err, result) {
                                                                        console.log("KERELA...");
                                                                        if(err) throw err;
                                                                        if(result === null){
                                                                            obj.collection('MARATHI').findOne({dish : dish}, function (err, result) {
                                                                                console.log("MARATHI...");
                                                                                if(err) throw err;
                                                                                if(result === null){
                                                                                    obj.collection('ORIYA').findOne({dish : dish}, function (err, result) {
                                                                                        console.log("ORIYA...");
                                                                                        if(err) throw err;
                                                                                        if(result === null){
                                                                                            obj.collection('PARSI').findOne({dish : dish}, function (err, result) {
                                                                                                console.log("PARSI...");
                                                                                                if(err) throw err;
                                                                                                if(result === null){
                                                                                                    obj.collection('PUNJABI').findOne({dish : dish}, function (err, result) {
                                                                                                        console.log("PUNJABI...");
                                                                                                        if(err) throw err;
                                                                                                        if(result === null){
                                                                                                            obj.collection('RAJASTHANI').findOne({dish : dish}, function (err, result) {
                                                                                                                console.log("RAJASTHANI...");
                                                                                                                if(err) throw err;
                                                                                                                if(result === null){
                                                                                                                    obj.collection('TAMIL').findOne({dish : dish}, function (err, result) {
                                                                                                                        console.log("TAMIL...");
                                                                                                                        if(err) throw err;
                                                                                                                        if(result === null){
                                                                                                                            console.log("Not Found in Normal");
                                                                                                                            searchInOthersFolder(dish, callback);
                                                                                                                        }else{
                                                                                                                            findShowArray(result, dish, callback);
                                                                                                                        }
                                                                                                                    })
                                                                                                                }else{
                                                                                                                    findShowArray(result, dish, callback);
                                                                                                                }
                                                                                                            })
                                                                                                        }else{
                                                                                                            findShowArray(result, dish, callback);
                                                                                                        }
                                                                                                    })
                                                                                                }else{
                                                                                                    findShowArray(result, dish, callback);
                                                                                                }
                                                                                            })
                                                                                        }else{
                                                                                            findShowArray(result, dish, callback);
                                                                                        }
                                                                                    })
                                                                                }else{
                                                                                    findShowArray(result, dish, callback);
                                                                                }
                                                                            })
                                                                        }else{
                                                                            findShowArray(result, dish, callback);
                                                                        }
                                                                    })
                                                                }else{
                                                                    findShowArray(result, dish, callback);
                                                                }
                                                            })
                                                        }else{
                                                            findShowArray(result, dish, callback);
                                                        }
                                                    })
                                                }else{
                                                    findShowArray(result, dish, callback);
                                                }
                                            })
                                        }else{
                                            findShowArray(result, dish, callback);
                                        }
                                    })
                                }else{
                                    findShowArray(result, dish, callback);
                                }
                            })
                        }else{
                            findShowArray(result, dish, callback);
                        }
                    })
                }else{
                    findShowArray(result, dish, callback);
                }
            })
        }else{
            findShowArray(result, dish, callback);
        }
    });
}

function searchInOthersFolder(dish, callback) {
    obj.collection('OTHER').find({dishName : dish}).toArray(function (err, result) {
        if(err) throw err;
        if(result.length === 0){
            console.log("Dish Not Found....");
            var res = [];
            var obj = {
                id : 0,
                dish : "",
                username : "",
                likes : 0
            };
            res.push(obj);
            callback(res);
        }else{
            var res = [];
            for(var i = 0; i < result.length; i++){
                var cobj = result[i];
                var objtba = {
                    id : cobj.id,
                    dish : cobj.dishName,
                    username : cobj.username,
                    likes : cobj.likes
                };
                res.push(objtba);
            }
            callback(objtba);
        }

    })
}

function findShowArray(object, dish, callback) {
    var list = object.posts;
    var arr = [];
    for(var i = 0; i < list.length; i++){
        var currobj = list[i];
        var objtbr = {
            id : currobj.id,
            dish : dish,
            username : currobj.username,
            likes : currobj.likes
        };
        arr.push(objtbr);
    }
    arr.sort(function(a, b) {
        return parseFloat(a.likes) - parseFloat(b.likes);
    });
    callback(arr);
}

function getObjectfromIdandDish(id, dish, callback){
    var region = id.substr(24);
    obj.collection(region).findOne({dish : dish}, function (err, result) {
        if(err) throw err;
        for(var i = 0; i < result.posts.length; i++){
            var cobj = result.posts[i];
            if(cobj.id === id){
                callback(cobj, region);
                return;
            }
        }
    });
}

function getObjectfromIdandDishUnapproved(id, dish, callback) {
    obj.collection("UNAPPROVED").findOne({id : id}, function (err, result) {
        if(err) throw err;
        callback(result);
    })
}

function disApproveDish(id, callback) {
    obj.collection("UNAPPROVED").deleteOne({id : id}, function (err, result) {
        callback();
    });
}

function addLike(id, dish, likes, callback){
    var region = id.substr(24);
    obj.collection(region).updateOne({dish : dish, "posts.id" : id }, {$set : {"posts.$.likes" : likes}} , function (err, result) {
        callback();
    });
}

function removeLikeFromUser(id, kiskIdSe, callback) {
    obj.collection(kiskIdSe).updateOne({name : "likes"}, {$pull : {likes : {id : id}}}, function (err, result) {
        if(err) throw err;
        callback();
    });
}

function addLikeToUser(username, id, dish, kiskIdSe, callback) {
    console.log(kiskIdSe);
    var objtba = {
        username : username,
        id : id,
        dish : dish
    };
    obj.collection(kiskIdSe).updateOne({name : "likes"}, {$push : {likes : objtba}}, function (err, result) {
        if(err) throw err;
        // console.log(result);
        callback()
    })
}

function isLiked(id, kiskiIdSe, callback) {
    console.log(kiskiIdSe);
    obj.collection(kiskiIdSe).findOne({name : "likes", "likes.id" : id}, function (err, result) {
        if(err) throw err;
        if(result === null){
            callback(false);
        }else{
            callback(true);
        }
    });
}

module.exports = {
    addNewPostToDish, getRegionList, getDishList, disApproveDish,
    getStateList, makeNewUser, connectDB, addToOther, addComment, getProfileDetails,
    searchForDishName, getObjectfromIdandDish, addLike, removeLikeFromUser,
    addLikeToUser, isLiked, addNewPostToUnapproved, getUnapproved, approveDish,
    getObjectfromIdandDishUnapproved
};
