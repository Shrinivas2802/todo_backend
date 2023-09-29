import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Todo from "../models/Todo.js"

export const register=async(req,res)=>{
    const {name,email,password,age}=req.body;

    try{
        let user=await User.findOne({email});
        if(user){
            return res.status(400).json({msg:"User already Exists"});
        }
        const salt=await bcrypt.genSalt(10);
        //console.log(`${password} ${salt}`);
        const hashedPassword=await bcrypt.hash(password,salt);
        
        user=new User({
            name,
            email,
            password:hashedPassword,
            age,
    });
    await user.save();

    const payload={
        user:user._id,
    };

    const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:360000});

    res.cookie("token",token,{httpOnly:true,expiresIn:360000});
    const {password:pass, ...rest}=user._doc;
    res.status(201).json({msg:"User created Successfully",user:rest});
    }catch(error){
        console.log(`${typeof(name)},${typeof(email)},${typeof(password)},${typeof(age)}`);
        console.error(error.message);
        res.status(500).json({errors:"Internal Server Error"});
    }
};
export const login=async(req,res)=>{
    const {email,password}=req.body;
    try{
        let user=User.findOne({email});
        //console.log("after finding user")
        if(!user){
            return res.status(400).json({msg:"User Not Found"});
        }
        //console.log("Before is match");
        console.log(`${user.name} ${user.password}}`);
       // console.log(`${user}`);
        const isMatch=await bcrypt.compare(password,user.password);
        
        if(!isMatch){
            return res.status(400).json({msg:"Invalid Credentials"});
        }
        
        const payload={
            user:user._id,
        };
    
        const token=jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:360000});
    
        res.cookie("token",token,{httpOnly:true,expiresIn:360000});
        const {password:pass, ...rest}=user._doc;
        res.status(201).json({msg:"User LoggedIn Successfully",user:rest});
    }catch(error){
        console.log(`${email},${password}`);
        //console.error(error.message);
        res.status(500).json({errors:"Internal Server Error"});
    }
};
export const logout=async(req,res)=>{
    res.clearCookie("token");
    res.status(201).json({msg:"User LoggedOut Successfully"});
};
export const getMe=async(req,res)=>{
    try{
        const user=await User.findById(req.user);
        if(!user){
            return res.status(404).json({msg:"User not found"});
        }
        const {password:pass, ...rest}=user._doc;
        return res.status(200).json({msg:"User Found",user:rest})
    }catch(error){
        console.error(error.message);
        res.status(500).json({errors:"Internal Server Error"});
    }
};
export const updateDetails=async(req,res)=>{
    const {name,email,age}=req.body;
    try{
        const user=await User.findById(req.user);
        if(!user){
            return res.status(404).json(({msg:"User Not Found!"}));
        }
        let exists=await User.findOne({email});
        if(exists && exists._id.toString()!==user._id.toString()){
            return res.status(404).json(({msg:"Email Already Exists"}));
        }
        user.name=name;
        user.email=email;
        user.age=user.age;
        await user.save();
        const {password:pass, ...rest}=user._doc;
        return res.status(200).json({msg:"User updated successfully",user:rest})
    }catch(error){
        console.error(error.message);
        res.status(500).json({errors:"Internal Server Error"});
    }

};
export const updatepassword=async(req,res)=>{
    const {password,newPassword}=req.body;
    try{
        let user=await User.findById(req.user);
        if(!user){
            return res.status(404).json(({msg:"User Not Found!"}));
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch) {
            return res.status(400).json({msg:"Invalid Credentials"});
        }

        const salt=bcrypt.genSalt(10);
        user.password=await bcrypt.hash(newPassword,salt);

        const {password:pass, ...rest}=user._doc;
        return res.status(200).json({msg:"Password updated successfully",user:rest});
    }catch(error){
        console.error(error.message);
        res.status(500).json({errors:"Internal Server Error"});
    }
};
export const deleteUser=async(req,res)=>{
    try{
        const user=await User.findById(req.user);
        if(!user){
            return res.status(404).json(({msg:"User Not Found!"}));
        }
        await user.remove();
        res.status(200).json({msg:"User deleted Successfully"});
    }catch(error){
        console.error(error.message);
        res.status(500).json({errors:"Internal Server Error"});
    }
};