import jwt, { decode }  from "jsonwebtoken";

const authorize=async(req,res,next)=>{
    const token=req.cookies.token;
    if(!token){
        return res.status(401).json({msg:"Not Authorized"});
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded.user;
        next();
    }catch(error){

    }
};

export default authorize;
