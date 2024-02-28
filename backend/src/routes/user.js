import express from 'express';
import {getAllUsers,getUserByID,registerUser,findUserByEmail,updateUser,deleteUser} from '../../database.js'

import { ObjectId } from 'mongodb';
import {check, validationResult} from 'express-validator'

import debug from  'debug';

const debugUser = debug('app:Users');


const router = express.Router();


router.get('/list', async(req,res) => {

  try
  {
    const users = await getAllUsers();
    res.status(200).json(users);
  }  
  catch(error)
  {
    res.status(500).json({message:'Server Error'});
  }

}); 

router.get(`/:userID`, async(req,res)=>{

  //gets the user with the  matching ID
  const foundUser = await getUserByID(new ObjectId(req.params.userID));

  
  if(foundUser){
    res.status(200).json(foundUser);
  }
  else{
    //send error message if user isn't found
    res.status(404).json({message:'The User is not in the database'});
  }

});


router.post(`/register`,
[
  check('email',  'Email is not valid').isEmail(),
  check('password','Password must be at least 6 characters long and contain a number').isLength({min:6}),
  check('fullName', 'Full Name field cannot be empty').isString(),
  check('givenName', "Given name is Required").isString(),
  check('familyName', 'Family name is required').isString(),
  check('role', 'Role is required').isString(),
]
,async(req,res) => {
  
  // get the errors if there is any
  const errors = validationResult(req);
  //if errors is not empty then store the errors into json array
  if (!errors.isEmpty()) 
  {
    return res.status(400).json({message: errors.array()});
  }

  try
  {
    const  newUser  = req.body;

  //check if user already exists in DB/array
  const findUser = await findUserByEmail(req.body.email);

  //if user exists, send message
  if(findUser)
  {
    res.status(400).json({message: 'Email is already in used.'});
  }
  else
  {
    newUser.creationDate = new Date();
    registerUser(newUser);
    res.status(200).json({message:  `New user created with the email ${newUser.email}`});
  }
  }
  catch(error)
  {
    res.status(500).json({message: 'Server Error.'})
  }

});





router.put(`/:userID`, async (req,res) => {
	
try
{
  // check if the user id exists in the db
  const user = await getUserByID(new ObjectId(req.params.userID));
  if(!user)
  {
   return res.status(404).json({ message : "No User Found With This ID!" });
  }

  const userUpdate = await updateUser(user._id, req.body);
  return res.status(200).json({message:'Updated Successfully.'});
}
catch(error)
{
  res.status(500).json({ message: "Failed to Update User", error });
}
  
});

router.delete(`/:userID`,async(req,res) =>{

try
{
  //check user if it exists in db
  const user  = await  getUserByID(new ObjectId(req.params.userID));
  if (!user)
  {
    return res.status(404).json({ message:"This user does not exist"})
  }
  else
  {
     await deleteUser(user._id);
     return res.status(200).json("User has been deleted");
  }
}
catch(error)
{
  return  res.status(500).json({message:"Server Error", error});
}

});





export{ router as userRouter }