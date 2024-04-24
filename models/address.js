var mongoose= require("mongoose");
var addressschema = new mongoose.Schema({
    address: String,
    address2:String,
    city:String,
    state: String,
    zip:String,
    
});

module.exports=mongoose.model("address", addressschema);