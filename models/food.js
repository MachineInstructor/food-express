var mongoose= require("mongoose");
var foodschema = new mongoose.Schema({
    name: String,
    price:String,
    type:String,
    image: String,
    description:String,
    recipe:String,
    // author:{
    //     id:{
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "user"
    //     },
    //     username:String
    // },
    comment:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"comment"
        }
    ]
});

module.exports=mongoose.model("food", foodschema);