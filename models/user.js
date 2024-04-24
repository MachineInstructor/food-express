var mongoose=require("mongoose");
var passportlocalmongoose= require("passport-local-mongoose");

var userschema= new mongoose.Schema({
   
   username:String,
   password:String,
   firstname:String,
   lastname:String,
   email:String,
   contact:String,
   isadmin: {type: Boolean, default: false},
      cart:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"cart"
        }
    ],
   address:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"address"
        }
    ],
    order:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"order"
        }
    ]
    
},{ versionKey: false });

userschema.plugin(passportlocalmongoose)

module.exports=mongoose.model("user", userschema);
