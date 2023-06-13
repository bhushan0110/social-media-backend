const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = async (req,res,next) =>{
    const token = req.header('auth-token');

    if(!token){
        return res.status(401).send({error:'Access Denied'});
    }

    try{
        const data = await jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    }
    catch(error){
        return res.status(401).send(error.message);
    }
};

module.exports = authenticate;