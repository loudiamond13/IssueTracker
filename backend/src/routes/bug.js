
import express from 'express';
const router = express.Router();
import debug from "debug";
import { getAllBugs,getBugByID,createBug,updateBug,getUserByID, connect } from '../../database.js';
import { ObjectId } from 'mongodb';
import { check, validationResult } from 'express-validator';
import Joi from 'joi';
const debugBug = debug(`app:BugRouter`);


//bugs list route
router.get(`/list`, async(req,res) => {
  try {
    //get the req.query 
    let {keywords, classification, maxAge, minAge, closed,sortBy, pageNumber, pageSize} = req.query;
    const match = {};
    const sort = {creationDate: -1}; // sort default to newest, descending 
    
    // if there are keywords search by them
    if (keywords){
      match.$text = {$search: keywords};
    }

    //if there is a classfication filter by it
    if (classification){
      match.classification  = classification;
    }


    // Check if maxAge is provided and not falsy
    if (maxAge && maxAge > 0) {
      const maxAgeInDays = parseInt(maxAge);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);
      match.creationDate = { $gte: cutoffDate };
    }

     // Check if minAge is provided and not falsy
     if (minAge && minAge > 0) {
      const minAgeInDays = parseInt(minAge);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - minAgeInDays);
      match.creationDate = { $lt: cutoffDate };
    }

    //check if open/close filter is  selected
    if (closed && closed.toLowerCase() === 'true') {
      match.isClosed = true;
    } else if (closed && closed.toLowerCase() === 'false') {
      match.isClosed = false;
    }

    // If sortBy parameter is provided, adjust sorting accordingly
    if (sortBy) {
      switch (sortBy) {
        case "oldest":
          sort.creationDate = 1;
          break;
        case "title":
          sort.title = 1;
          sort.creationDate = -1;
          break;
        case "classification":
          sort.classification = 1;
          sort.creationDate = -1;
          break;
        case "assignedTo":
          sort.assignedTo = 1;
          sort.creationDate = -1;
          break;
        case "createdBy":
          sort.createdBy = 1;
          sort.creationDate = -1;
          break;
        // Default to newest if sortBy value is invalid
        default:
          break;
      }
    }

    //set up the pagination/pagesize
     pageSize = parseInt(pageSize) || 5; // default to 5 items/documents
     pageNumber = parseInt(pageNumber) || 1; // default to page one

    //pipeline
    const pipeline = [
      {$match: match},
      {$sort: sort},
      {$skip: (pageNumber - 1) * pageSize},
      {$limit: pageSize}
    ];


    //connect to the db
    const db = await connect();
    const cursor = await  db.collection("bugs").aggregate(pipeline);
    const  bugs = await cursor.toArray();


    return res.status(200).json(bugs);

  } 
  catch (error) {
    return res.status(500).json({message: 'Server Error.'})
  }
});



//get bug by id route
router.get(`/:bugId`, async(req,res) => {
  try
  {
    const bug = await getBugByID(new ObjectId(req.params.bugId)); // get the bug  with this params ID

    //if no bug exist in db, send error message, else send the bug
    if(!bug)
    {
      return res.status(404).send("No Bug found");
    }
    else
    {
      return res.status(200).json(bug)
    }
    
  }
  catch(error)
  {
    return res.status(500).json({message: 'Server Error.'})
  }
});


//bug creating route
router.post(`/new`,
[
  check('title', 'Title is required').isString(),
  check('description', 'Description is required').isString(),
  check('stepsToReproduce', 'Steps to reproduce is required').isString(),
]
,async (req,res) => {
  
  const errors = validationResult(req);
  //check if there is any input validation
  if(!errors.isEmpty())
  {
    return res.status(400).json({errors: errors.array()});
  }

  debugBug(`bug create/new route hit`);
  const newBug = req.body;

  try
  {
    debugBug(newBug)
    newBug.creationDate = new Date();
    const bug =  await createBug(newBug);
    return res.status(200).json(`New bug reported! ${bug}`);
  }
  catch(error)
  {
    return res.status(500).send(`Error in server${error}`);
  }
  
  
});


//bug update route
router.put(`/:bugId`, async (req,res) => {
  //get the bugId from parameter path
  const bugId = req.params.bugId;

  //gets the input from body
  const updatedBug = req.body;
  try
  {
    updatedBug.lastUpdated = new Date(); // add the last updated of current date

    const bug = await getBugByID(new ObjectId(bugId)); // check if bug exists in db

    if(!bug)
    {
       res.status(404).json('The bug does not exist');
    }
    else
    {
      await updateBug(new ObjectId(bugId), updatedBug);
      return res.status(200).json({message: `Bug ${bugId} updated`, bugId});
    }
  }
  catch(error)
  {
    return res.status(500).json({message: 'Server Error.'});
  }
});


//bug classification route
router.put(`/:bugId/classify`,
[
  check('classification').isString()
]
,async(req,res) =>{
  debugBug(`classify route is hit.`);

  const errors = validationResult(req);
  if(!errors.isEmpty())
  {
    return res.status(400).json({errors: errors.array()});
  }

  try
  {
    const bugClassification = req.body;
    let bug = await getBugByID(new ObjectId(req.params.bugId));

    //check if bug exist in db
    if (!bug)
    {
     return res.status(404).json({message: `Bug with id ${req.params.bugId} does not exist.`});
    }
    //set classification
    else
    {
      bug.classification = bugClassification.classification;
      bug.classifiedOn = new Date();
      bug.lastUpdated =  new Date();

      await updateBug(new ObjectId(req.params.bugId), bug);
      return res.status(200).json({message:`Bug  with id ${req.params.bugId} has been classified.`});
    }
  }
  catch(error)
  {
    return res.status(500).json({message: "Internal Server Error"})
  }

});

//assign user to a bug route
router.put(`/:bugId/assign`,
[
  check('assignedToUserId', 'Please provide valid User ID').isString(),
],async(req,res) => {
 
  const errors = validationResult(req);
  if(!errors.isEmpty())
  {
    return res.status(400).json({errors: errors.array()});
  }

  try
  {
    
    const bugId = req.params.bugId;
    const assignToUser = req.body;

    let bug = await getBugByID(new ObjectId(bugId));
    const  assignedUser = await getUserByID(new ObjectId(assignToUser.assignedToUserId));
    //check if bug exist in db
    if(!bug)
    {
      return res.status(404).json({ message : `No Bug found with the id ${bugId}` });
    }
    //if bug exist, assign a user
    else
    {
      bug.assignedToUserId = assignToUser.assignedToUserId;
      bug.assignToUserName = assignedUser.fullName; 
      bug.assignedOn = new Date();
      bug.lastUpdated =  new Date();

      await updateBug(new ObjectId(bugId), bug);
      return res.status(200).send("Assign Successful");
    }

  }
  catch(error)
  {
    return res.status(500).json({message: `Internal Server Error! ${error}`})
  }

});

//bug close route
router.put(`/:bugId/close`,
[
  check('closed', `Please type 'close' to close this bug`).isString()
]
,async(req,res) =>{
  
  const errors = validationResult(req);
  if(!errors.isEmpty())
  {
    return res.status(400).json({errors: errors.array()});
  }

  try
  {
    let bug = await getBugByID(new ObjectId(req.params.bugId));

    //if  no bug is found send error message
    if(!bug)
    {
      return res.status(404).json({ message : `No Bug found with the id ${req.params.bugId}` });
    }
    else
    {
      const isClosed = req.body;
      if(isClosed.closed == `close`)
      {
        bug.closedOn = new Date();
        bug.isClosed = true;
        bug.lastUpdated = new Date();

        await updateBug(new ObjectId(req.params.bugId),bug);
        return res.status(200).json({message: `Bug ${req.params.bugId} has been closed`});
      }
    }
  }
  catch(error)
  {
    return res.status(500).json({message: `'Internal Server Error!' ${error}`})
  }
  

});


//add   comment to a bug
router.put(`/:bugId/comment/new`, async(req,res)=>
{
  try {
    //comment schema
     const commentSchema = Joi.object({
      author: Joi.string().required(),  // ask Mr. G if this  should be an string/name or user id
      commentText:Joi.string().required(),
      createdAt: Joi.date().iso().default(new Date()),
     });
     
     //validate the input
     const {error,value}= commentSchema.validate(req.body);
     if (error)  
     {
       console.log('Error in validation', error);
       return res.status(400).json({ error: error.details[0].message });
     }

     // open a db connection
     const db = await connect();
     // add the comment to the  database
     const comment = await db.collection("comments").insertOne({bugId: new ObjectId(req.params.bugId) , ...value});

     return res.status(200).json({message:`Comment  added successfully! ${comment.insertedId}`});
  } 
  catch (error) {
    return res.status(500).json({message: 'Server Error.'});
  }
});


//get a comment  by its ID
router.get(`/:bugId/comment/:commentId`,async (req,res)=>{
  try {
    //open a db connection
    const db = await connect();
    
    //find the commnet with the given Id
    const comment = await db.collection('comments').findOne({_id : new ObjectId(req.params.commentId)});

    //if there is no such comment send a  not found response
    if(!comment){
      return res.status(404).json({ message:'No Comment Found'})
    }
    else{
      return res.status(200).json(comment);
    }
  } 
  catch (error) {
    return res.status(500).json({message: `Server Error.`});
  }
});


//get all comment list  of a particular bug
//note: router won't hit if I don't make the "comment" plural  here
router.get(`/:bugId/comments/list`, async(req,res)=>
{
  try {
    //open a db connection
    const db = await connect();
    //find the comments for this bug id from the collection
    const comments = await db.collection('comments').find({bugId: new ObjectId(req.params.bugId)}).toArray();


    //check if there is comments for the bug
    if(!comments || !comments.length) {
      return res.status(404).json({message:`There is no comment for this bug.`});
    }
    else
    {
      return res.status(200).json(comments);
    }
  } 
  catch (error) {
    return res.status(500).json({message: `Server Errors.`});
  }
});


//add tests cases to a bug 
router.put('/:bugId/test/new', async(req,res)=>
{
  try {
    //test case schema
    const testCaseSchema = Joi.object({
      testTitle :Joi.string().required().messages({ 'any.required': 'Test title field cannot be empty'}),
      expectedOutput :Joi.string().required().messages({ 'any.required': 'Test output field cannot be empty'}),
      result: Joi.string().valid('passed','failed').required().messages({'any.required': 'Test result is required, must be passed or failed.'}),
      testedAt:  Joi.date().iso().default(new Date()),
    });

    const {error, value} = testCaseSchema.validate(req.body);

    //check if there is error on input/req.body
    if(error){
      console.log('Error in validation', error);
       return res.status(400).json({ message: error.details[0].message });
    }
    else{ //if there is no error, add the new bug test to db
      //open db connection
      const db = await connect();

      //add the new test to db
      const newTestCase = await db.collection("tests").insertOne({bugId: new ObjectId(req.params.bugId), ...value});

      debugBug(newTestCase);
      return res.status(200).json({message: `New Test Case for the bug ${req.params.bugId} successfully added.`});
    }
  } 
  catch (error) {
    return res.status(500).json({message: 'Server Error.'});
  }
});

//update a test
router.put('/:bugId/test/:testId', async(req,res)=>
{
  try {
    //open db connection
    const db = await connect();
    
    //find the test 
    const test = await db.collection('tests').findOne({
      _id: new ObjectId(req.params.testId), 
      bugId: new ObjectId(req.params.bugId)
    });

    //check if there is a test found, if there is no test found, send an error message
    if(!test){
      return res.status(404).json({message:  "The test does not exist."});
    }
    else{
      //update the test with new data from req.body
      let updatedTest = req.body;

      //set the updated test
      updatedTest.updatedAt = new Date().toISOString();

      //update the test
      const updatedResult = await  db.collection("tests").findOneAndUpdate(
        {_id : test._id},
        {$set: updatedTest}
      );
      
      //send back the update test info
      return res.status(200).json({message: `Test ${test._id} updated successfully`});
    }
  } 
  catch (error) {
    return res.status(500).json({message: 'Server Error'});
  }
});

//get a bug test
router.get('/:bugId/test/:testId', async(req,res)=>{
  try {
    //connect to the database
    const db = await connect();

    //find the test in db
    const test = await db.collection('tests').findOne({
      _id: new ObjectId(req.params.testId),  
      bugId: new ObjectId(req.params.bugId)
    });

    //check if the bug test exists
    if(!test)
    {
      return res.status(400).json({message: 'No bug test found.'});
    }
    else{
      return res.status(200).json(test);
    }
  } 
  catch (error) {
    return res.status(500).json({message: 'Server Error'});
  }
});


//get a bug test list 
router.get('/:bugId/tests/list', async (req,res)=>
{
  try {
    //open  db connection
    const db=await connect();

    const tests = await db.collection("tests").find({ bugId : new ObjectId(req.params.bugId)}).toArray();

    //check if there are test/tests for this bug
    if(!tests || tests.length===0){
      return res.status(404).json({ message:"No tests exists."});
    }
    else{
      return res.status(200).json(tests);
    }
  } 
  catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});


//deletes a bug test
router.delete('/:bugId/test/:testId', async(req,res)=>
{
  try {
    //open db connection
    const db=await connect();

    //find the test from db
    const  deletedTest = await db.collection('tests').findOneAndDelete({
      _id:new ObjectId(req.params.testId), 
      bugId: new ObjectId(req.params.bugId),
    });
  
    //check if it was deleted  or not
    if (!deletedTest) {
       return res.status(404).json({message: `No test found.`});
    }
    else{
      return res.status(200).json({message:`Test deleted successfully`});
    }
    
  } 
  catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});


export{router as bugRouter};