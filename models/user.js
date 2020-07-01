const mongoose = require('mongoose');
const uniqueValidator=require('mongoose-unique-validator');

const Schema =mongoose.Schema;

const userSchema= new Schema({
    userName:{type: String,required:true},
    email:{type:String,required:true,unique:true},//index for email to speed up
    password: {type:String,required:true,minlength:6},
    image: {type:String,required:true},
    places:  [{type:mongoose.Types.ObjectId,required:true,ref:'Place'}]//connect user to place,as use [] to store more than one value
});

userSchema.plugin(uniqueValidator);
//collection in mongo
module.exports=mongoose.model('User',userSchema);