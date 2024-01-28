

import express from 'express';

const router = express.Router();

//FIXME: use this array to store user data in for now
//we will replace this with a database in later assignment
//list/array of users
const usersArr = 
[
  {userID: 1,firstName: `Lou`, lastName: `Loyloy`, email: `lou@gmail.com`,password: `lou123`,role:`Customer`,lastUpdated: Date(),userCreationDate: Date()},
  {userID: 2,firstName: `Nohea`, lastName: `Yazmin`, email: `nohea@gmail.com`,password: `nohea123`,role:`Employee`,lastUpdated: Date(),userCreationDate: Date()},
  {userID: 3,firstName: `Danielle`, lastName: `Mendoza`, email: `danielle@gmail.com`,password: `danielle123`,role:`Admin`,lastUpdated: Date(),userCreationDate: Date()}
]



router.get('/list',(req,res) => {
  res.status(200).json(usersArr);
}); 

router.get(`/:userID`,(req,res)=>{
  //Reads the userID from the URL and stores in a var
  const  id= req.params.userID;
  
  //gets the user with the  matching ID
  const foundUser = usersArr.find(user => user.userID == id);

  //FIXME: Get the user from usersArr and send response as JSON.
  if(foundUser){
    res.status(200).json(foundUser);
  }
  else{
    //send error message if user isn't found
    res.status(404).json({message:'The User is not in the database'});
  }

  // console.log(id);
  // res.status(200).send(`User with id  ${id} is requested. \n  ${foundUser}`);
});


router.post(`/register`,(req,res) => {
  //FIXME: Register new user and send response as JSON
  const  newUser  = req.body;

  //check if user already exists in DB/array
  const findUser = usersArr.find(user => user.email == newUser.email);

  //if user exists, send message
  if(findUser)
  {
    res.status(400).type(`text/plain`).send(`User already exists.`);
  }

  //create a unique id for the user based on the array.length
  newUser.userID = usersArr.length + 1;
  if(!newUser.email){
    return res.status(400).type(`text/plain`).send("Email must be provided.");
  }
  else if(!newUser.firstName){
    return res.status(400).type(`text/plain`).send("First name must be provided.");
  }
  else if(!newUser.lastName){
    return res.status(400).type(`text/plain`).send(`Last name must be provided.`);
  }
  else if(!newUser.role){
    return res.status(400).type(`text/plain`).send(`Role is required.`);
  }


  console.log(newUser);
  //set the creation date of the newUser
  newUser.userCreationDate = Date();
  usersArr.push(newUser);

  res.status(200).json({message:  "New user created!" , user : newUser });

});


// user log in route
router.post(`/login`,(req,res) => {
    //FIXME: check user’s email and password and send response as JSON
    const user = req.body;

  //add validation for inputs
  if(!user.email){
    return res.status(400).type(`text/plain`).send(`Email must be provided.`);
  }
  else if (!user.password){
    return res.status(400).type(`text/plain`).send( `Password must be provided.`);

  }
  //else if inputs are filled or valid, check/find the email input and password input
  else{
    const searchUser = usersArr.find(x => x.email == user.email && x.password == user.password);

      // if user is found, respond with a success message
    if(searchUser){
    res.status(200).type(`text/plain`).send(`${searchUser.firstName} logged in successfully`);
    }
    //else if no user is matched/found, send a failed/error message
    else{
      res.status(400).type(`text/plain`).send( `Invalid email/password.`);

    }
  }
    
});


router.put(`/:userID`, (req,res) => {
	//FIXME: update existing user and send response as JSON
	
//get the current user’s id
  const id = req.params.userID;

	//find the user to update from DB/array
	const updateUser = usersArr.find(user => user.userID == id);
	
  //get the inputs to update
	const updatedUSER = req.body;

	//if user is found
	if(updateUser)
  {
    for(const key in updatedUSER)
    {
      //update 
      updateUser[key] = updatedUSER[key];
      updateUser.lastUpdated = Date();
    }

    //save the updated user info
    const userIndex = usersArr.findIndex(user => user.userID == id);

    if(userIndex != -1)
    {
      usersArr[userIndex] = updateUser;
    }

    res.status(200).send( `User ${id} updated successfully.`);
  }
  //if user is not found, send message
  else
  {
    res.status(404).type(`text/plain`).send(`User ${id} not found.`);
  }
  
});

router.delete(`/:userID`,(req,res) =>{

  //get the ID of the user to delete
  const id = req.params.userID;

  //find and remove the user from array
  const index = usersArr.findIndex(u => u.userID == id);
  if(index !== -1)
  {
    usersArr.splice(index,1);
    return res.status(200).type(`text/plain`).send(`User with id:${id} deleted successfully.`);
  }
  //else if can't find the user in DB/array, send message
  else
  {
    return res.status(400).type(`text/plain`).send(`User with id:${id} does not exist`);
  }

});





export{ router as userRouter }