const mongoose=require('mongoose');
const validator=require('validator');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is a mandatory field"]
    },
    email:{
        type:String,
        unique:true,
        lowercase:true,
        required:[true,"Email is a mandatory field"],
        validate:[validator.isEmail,"Not a valid Email"]
    },  
    password:{
        type:String,
        required:[true,"Password is a mandatory field"],
        minlength:8
    },
    photo:String,
    passwordConfirm:{
        type:String,
        required:[true,"Please Confirm Password"],
    }
})

const User=mongoose.model('User',userSchema);

model.exports=User;