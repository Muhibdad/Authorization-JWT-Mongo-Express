const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcrypt');

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
        minlength:8,
        select:false
    },
    photo:String,
    passwordConfirm:{
        type:String,
        required:[true,"Please Confirm Password"],
        validate:{
            //this only work on .create and .save()!!!
            validator:function(el){
                return el===this.password;
            },
            message:"Passwords are not same"

        },
        select:false
    }
})

userSchema.pre('save',async function(next){     
    if(!this.isModified("password")){
        return next();
    } 
    else{
        this.password=await bcrypt.
        hash(this.password,12);

        this.passwordConfirm=undefined;
        next();
        
    }
});

userSchema.methods.correctPassword=async function(candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword);
}

const User=mongoose.model('User',userSchema);

module.exports=User;
