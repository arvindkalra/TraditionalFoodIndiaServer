var username = $('#usernameid').attr('data-set');
var dish_name = $('#dishname').attr('data-set');
var kiski = $('#kiski').attr('data-set');
var id = $('#id').attr('data-set');
var state = $('#state').attr('data-set');

$('#addbtn').click(function () {
    var text = $('textarea#addcomment').val();
    $('textarea#addcomment').val("");
    var objtbs = {
        username : username,
        kiski : kiski,
        id : id,
        comment : text,
        state : state,
        dish_name : dish_name
    };
    $.post('/comment/add', objtbs, function (result) {
        $('#comments').append("<div class='comment'><span class='cuser'>"+kiski+"&nbsp;</span>"+text+"</div>");
    })
});

$('#likebtn').click(function () {
    var bool = $('#likebtn').attr('data-value');
    var number = parseInt($('#number').text(), 10);
    console.log(bool);
    if(bool === "true"){
        console.log("Inside If");
        number = number - 1;
        var obj = {
            username : username,
            dish : dish_name,
            id : id,
            kiska : kiski,
            likes : number
        };
        $.post('/like/remove', obj, function (result) {
            $('#number').text(number);
            $('#likebtn').attr('data-value', "false");
            $('#likebtn').css('color', "black");
        })
    }else{
        console.log("Inside Else");
        number = number + 1;
        var obj = {
            username : username,
            dish : dish_name,
            id : id,
            kiska : kiski,
            likes : number
        };
        $.post('/like/add', obj, function (result) {
            $('#number').text(number);
            $('#likebtn').attr('data-value', "true");
            $('#likebtn').css('color', "blue");
        })
    }
});