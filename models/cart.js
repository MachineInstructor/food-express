var mongoose=require("mongoose");

var cartschema= new mongoose.Schema({
   
        peice:String,
        obj:{
                id:{
                type:mongoose.Schema.Types.ObjectId,
                 ref:"food"
                 },
                 name:String,
                 price:String,
                 image:String
            }
    
});


module.exports=mongoose.model("cart", cartschema);
