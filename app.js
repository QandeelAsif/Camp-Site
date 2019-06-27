var express     =require("express"),
    mongoose     = require("mongoose"),
    passport    =require("passport"),
localStrategy    =require("passport-local"),
expressSession  =require("express-session"),
    Campground   =require("./models/campground"),
    Comment      =require("./models/comments"),
        User     =require("./models/user"),
        app     =express(),
 bodyParser     =require("body-parser");
   SeedDB       =require("./seeds");


//seeding the database
//SeedDB();
   //connect mongoose to DB
mongoose.connect("mongodb://localhost:27017/beyond_the_tent",{useNewUrlParser:true});

    //setting things up
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret:"sb scam hai..!!",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//function to be passed on to every route to pass signed in user to each one, rather than explicitly defining it in each
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    next();
});

///============================
//     RESTFUL  ROUTES
///============================

//RESTFUL ROUTE: INDEX  --displays camp

app.get("/",function(req,res){
    res.render("homepage");
});

app.get("/campgrounds",function(req,res){
    console.log(req.user);
    //retrieving all campgrounds from db
    Campground.find({},function(err,allcamps)
    {
        if(err)
        console.log(err);
        else
        res.render("campgrounds/index",{camps:allcamps});
    })
})



//RESTFUL ROUTE: CREATE  --takes the new camp from form and post it on the displaying page

app.post("/campgrounds",isLoggedIn,function(req,res){
    var name=req.body.name;
    var image=req.body.image;
    var description=req.body.description;
    //to save the vreator to db
    var author={
        id: req.user._id,
        username:req.user.username
    }
    var newCampground={name:name,image:image,description:description,author:author};
    //create new campground and save to db
    Campground.create(newCampground,function(err,newlycamp){
        if(err)
            console.log(err)
        else
         //redirect
        res.redirect("/campgrounds")
    })
})


//RESTFUL ROUTE: NEW   --displays from to add new camp
app.get("/campgrounds/new",isLoggedIn,function(req,res){
    res.render("campgrounds/new")
})


//RESTFUL ROUTE:SHOW  --displays info about a single camp
app.get("/campgrounds/:id",function(req,res){
    //find camp with given id
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundcamp){
        if(err)
        console.log(err)
        else
        {console.log(foundcamp)
            //render the show template
            res.render("campgrounds/show",{camp:foundcamp});
        }
    })
    
})

//=====================
//  COMMENTS ROUTES
//=====================

//NEW ROUTE
app.get("/campgrounds/:id/comments/new",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err)
        log(err)
        else{
            res.render("comments/new",{campground:campground})
        }
    });
});

//SHOW ROUTE
app.post("/campgrounds/:id/comments",isLoggedIn,function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err)
        {
            res.redirect("/campgrounds");
        }
        else{
            Comment.create(req.body.comments,function(err,comment){
                if(err)
                log(err)
                else{
                    //automaticall add username and id to comment
                    comment.author.id=req.user._id;
                    comment.author.username=req.user.username;
                    //push comment to db
                    comment.save();                    campground.comments.push(comment);
                    campground.save();
                    //redirec to camp's show page
                    res.redirect("/campgrounds/"+campground._id);
                }
            })
        }
    });
})


///============================
//      AUTH  ROUTES
///============================

//Registration form
app.get("/register",function(req,res){
    res.render("register");
})

//Registration form posted here
app.post("/register",function(req,res){
    var newUser= new User({username:req.body.username});
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        passport.authenticate("local")(req,res,function(){
                res.redirect("/campgrounds");
        });
    })
})

//login form
app.get("/login",function(req,res){
    res.render("login");
});

//login form posted here
app.post("/login",passport.authenticate("local",{
    successRedirect:"/campgrounds",
    failureRedirect:"/login"
}),function(req,res){
});

//logout route
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/campgrounds");
})

//MIDDLEWARE AUTHENTICATION FUNCTION
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//listener port
app.listen(3000,function(){
    console.log("Server started");
})