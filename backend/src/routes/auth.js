import express from 'express';
import Joi from 'joi';
import verifyToken from '../middleware/auth.js';
import {check, validationResult} from 'express-validator'
import {findUserByEmail} from '../../database.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const router = express.Router();



// Define Joi schema for email and password validation
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// user log in route
router.post(`/login`,
[
  check("email", 'Email is Required.').isString(),
  check('password', 'Password is Required').isString(),
]
 ,async(req,res) => {
  //add validation for inputs
 // get the errors if there is any
  const errors = validationResult(req);
  //if errors is not empty then store the errors into json array
  if (!errors.isEmpty()) 
  {
    return res.status(400).json({message: errors.array()});
  }

  try
  {
    const {email,password} = req.body;
    //get the user from the database using the provided email 
    const user = await findUserByEmail(email);
    
    if(!user)
    {
      return res.status(400).json({message:"Invalid Email or Password"});
    }
   
   
    //checking if password matches with hashed password stored in the database
    const isValidPassword= await bcrypt.compare(password,user.password);

    // if password matched, return success
    if(isValidPassword)
    {
      
      //process the token
      const token = jwt.sign({user_id: user._id,user_role: user.role, givenName: user.givenName, familyName: user.familyName},
                            process.env.JWT_SECRET_KEY, {expiresIn: '1d'});
      
      
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 86400000
      });

      res.status(200).json({message: `Welcome Back ${user.fullName}!`});
    }
    else
    {
      return res.status(401).json({message:"Invalid Email or Password"});
    }

  }
  catch(error)
  {
    res.status(500).json({message:'Internal Server error', error});
  }
    
});

//validate the auth token
router.get('/validate-token', verifyToken, (req,res)=> {

  res.status(200).send({user_id: req.user_id, givenName: req.givenName, familyName: req.familyName, role: req.role});
});


//remove the auth_token
router.post(`/logout`, async (req,res)=>{

  res.cookie(`auth_token`,'', {
  expires: new Date(0),
  });

return res.status(200).json({message:`You have been logged out.`})
  
});


export {router as authRouter};

