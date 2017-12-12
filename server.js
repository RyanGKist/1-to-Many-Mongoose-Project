//Config
var express = require('express');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/One-to-Many-DB');
//Schemas
var Schema = mongoose.Schema;
var PostSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength:4},
    text: { type: String, required: true},
    comments: [{type:Schema.Types.ObjectId, ref:'Comment'}]
}, {timestamps: true});
mongoose.model('Post', PostSchema);
var Post = mongoose.model('Post');

var CommentSchema = new mongoose.Schema({
    _post: {type: Schema.Types.ObjectId, ref:'Post'},
    text: {type: String, required: true},
}, {timestamps: true});
mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment');


var path = require('path');

var app = express();
var bodyParser = require ('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

//Routes
app.get('/', function(req, res){
    Post.find({},false, true).populate('comments').exec(function(err, post){
        if (err){
            console.log(err)
            res.render('index');
        }else{
            console.log(post);
            res.render('index', {posts : post})
        }
    })
})
//Post Message
app.post('/submitMessage', function (req, res){
    var new_post = new Post()
    new_post.name = req.body.name
    new_post.text = req.body.post
    new_post.save(function(err){
        if (err){
            console.log(err);
            res.redirect('/');
        }else{
            console.log('successfully added Post!');
                res.redirect('/');
            }
        })
    })
//Post Comment
app.post('/submitComment/:id', function(req, res){
    Post.findOne({_id: req.params.id}, function(err,post){
        var comment = new Comment(req.body);
        comment._post = post._id;
        comment.text = req.body.comment;
        post.comments.push(comment);
        comment.save(function(err){
            post.save(function(err){
                if(err){
                    console.log(err);
                    res.redirect('/');
                }else{
                    console.log('Successfully added Comment to ' + req.params.id);
                    res.redirect('/');
                }
            })
        })
    })
})


//Port 
app.listen(8000, function(){
    console.log('Testing on port 8000!')
})