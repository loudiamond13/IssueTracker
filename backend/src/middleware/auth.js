
import jwt from 'jsonwebtoken';

const verifyToken = (req,res,next)=>{
  const token = req.cookies['auth_token'];

  //check if there is token
  if(!token) {
    return res.status(401).send({ auth: false, message: 'Not Authorized.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user_id = decoded.user_id;
    req.givenName = decoded.givenName;
    req.familyName = decoded.familyName;
    req.role = decoded.role;
    next();
  } 
  catch (error) {
    return res.status(401).send({ message: 'Not authorized.' });
  }
}


export  default verifyToken;