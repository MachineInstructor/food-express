rvar mongoose=require("mongoose");
var food= require("./models/food");
var comment= require("./models/comment");

var data =[
        {
            name:"abc", 
            image:"https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80", 
            description:"Lorem ipsum, or lipsum as it is sometimes known, is dummy text used in laying out print, graphic or web designs. The passage is attributed to an unknown typesetter in the 15th century who is thought to have scrambled parts of Cicero's De Finibus Bonorum et Malorum for use in a type specimen book. It usually begins with"
        },
        {
            name:"xyz", 
            image:"https://farm9.staticflickr.com/8605/16573646931_22fc928bf9_o.jpg",
            description:"Lorem ipsum, or lipsum as it is sometimes known, is dummy text used in laying out print, graphic or web designs. The passage is attributed to an unknown typesetter in the 15th century who is thought to have scrambled parts of Cicero's De Finibus Bonorum et Malorum for use in a type specimen book. It usually begins with"
        },
        {
            name:"qwert", 
            image:"https://wordpress.accuweather.com/wp-content/uploads/2019/03/camping-thumbnail.11.4920AM-1.png?w=632",
            description:"Lorem ipsum, or lipsum as it is sometimes known, is dummy text used in laying out print, graphic or web designs. The passage is attributed to an unknown typesetter in the 15th century who is thought to have scrambled parts of Cicero's De Finibus Bonorum et Malorum for use in a type specimen book. It usually begins with"
        },
        
        ];

function seeddb(){
  food.remove({},function(err){
    if(err){
        console.log("err");
    }
    
    else{
      console.log("database cleared");   
      data.forEach(function(seed){
    food.create(seed, function(err, food){
        if(err){
            console.log(err);
        }else{
            console.log("campground created");
            comment.create({
                text:"asdfgasdfgasdfasasdasasas",
                author:"osama"
            },function(err,comment){
              if(err){
                  console.log(err);
              } else{
                  food.comment.push(comment);
                  food.save();
                  console.log("comment created");
              }
            });
        }
    });
});
    }
   
});
comment.remove({},function(err){
    if(err){
        console.log("err");
    }

});
}
module.exports=seeddb;

