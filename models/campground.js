var mongoose=require("mongoose");

//schema for the camps
var campgroundsSchema=new mongoose.Schema({
    name:String,
    image:String,
    description:String,
    //added an author to know who created the campground automatically
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    },
    comments:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    }     
    ]
});

//modelling for mongoose
module.exports=mongoose.model("Campground",campgroundsSchema);
