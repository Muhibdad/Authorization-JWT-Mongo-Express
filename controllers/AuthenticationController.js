const jwt=require('jsonwebtoken');
const {promisify}=require('util');
const User=require('./../models/userModel');
const catchAsync=require('./../utils/catchAsync');
const AppError=require('./../utils/appError');

const signToken=id=>{
    return jwt.sign({id:id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES
    })
}

exports.signup= catchAsync(async(req,res,next)=>{
        const newUser=await User.create({
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            passwordConfirm:req.body.passwordConfirm
        });

        const token =signToken(newUser._id);
        res.status(201).json({
            status:'success',
            token,
            data:{
                user:newUser
            }
        })
    
})

exports.login=catchAsync(async(req,res,next)=>{
    const {email, password}=req.body;
    //1.Check if email and password exist
    if(!email || !password){
       return next(new AppError('Please provide email and password',404));
    }
    //2.Check if user exist && password is correct
    const user= await User.findOne({email}).select('+password');
    
    console.log(`Password: ${password} Encrypted: ${user.password}`);
    console.log(user);
    // const correct=await user.correctPassword(password,user.password);
    // console.log(correct);
    if(!user || !await user.correctPassword(password,user.password)){
            return next(new AppError('Incorrect Email or Password',401))
    }
    //3.If everything is ok, send token to client
    const token=signToken(user._id);
    res.status(200).json({
        status:'success',
        token
    })
})

exports.protect=catchAsync(async(req,res,next)=>{
    //1.Get the token it it exist.
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token =req.headers.authorization.split(' ')[1];//its an array
    }
    // console.log(token)

    if(!token){
        return next(new AppError('You are not logged in',401));
    }
    //2.verification token
    const decoded= await promisify(jwt.verify)(token,process.env.JWT_SECRET,)
    // console.log(decoded);
    
    //3. check if user exists

    const freshUser=await User.findById(decoded.id);
    if(!freshUser){
        return next(new AppError("The User does not exist",401));
    }
    //4.check if user changed password after the token was issued
    next();
})