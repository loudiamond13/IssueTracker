
import express, { json } from 'express';
const router = express.Router();
import debug from "debug";
import { getBugByID,getUserByID, connect } from '../../database.js';
import { ObjectId } from 'mongodb';
import { check, validationResult } from 'express-validator';
import Joi from 'joi';
import { isLoggedIn, fetchRoles ,mergePermissions, hasPermission} from '@merlin4/express-auth';
import { addEditRecord } from '../services/editService.js';
const debugBug = debug(`app:BugRouter`);


//bugs list route
router.get(`/list`, isLoggedIn(), hasPermission('canViewData'), async(req,res) => {
  try {
    //get the req.query 
    let {keywords, classification, maxAge, minAge, isClosed,sortBy, pageNumber, pageSize} = req.query;
    const match = {};
    const sort = {creationDate: -1}; // sort default to newest, descending 
    
  
    // if there are keywords search by them
    // If there are keywords, search by them using partial matching
    if (keywords) {
      // construct a regular expression to match partial words
      const regex = new RegExp(keywords, 'i'); // 'i' flag for case-insensitive matching

      // Match the field against the regular expression
      match.$or = [
        { "title": { $regex: regex } }, 
        { "createdBy.fullName": { $regex: regex } }, 
      ];
    }


    //if there is a classfication filter by it
    if (classification){
      match.classification  = classification;
    }


    // check if maxAge is provided and not falsy
    if (maxAge && maxAge > 0) {
      const maxAgeInDays = parseInt(maxAge);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);
      match.creationDate = { $gte: cutoffDate };
    }

     // check if minAge is provided and not falsy
     if (minAge && minAge > 0) {
      const minAgeInDays = parseInt(minAge);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - minAgeInDays);
      match.creationDate = { $lt: cutoffDate };
    }

    //check if open/close filter is  selected
    if (isClosed && isClosed.toLowerCase() === 'true') {
      match.isClosed = true;
    } else if (isClosed && isClosed.toLowerCase() === 'false') {
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
    const totalCount = await db.collection('bugs').countDocuments(match);

    const  bugs = await cursor.toArray();

    
    return res.status(200).json({bugs, totalCount});

  } 
  catch (error) {
    debugBug(error)
    return res.status(500).json({message: 'Server Error.'})
  }
});

// get bugs created by the current user
router.get(`/my-bugs`, isLoggedIn(), hasPermission('canViewData'), async (req, res) => {
  try {
    // get the current user  from the request
    const currentUser = req.auth;
    // get the query parameters
    let { keywords, classification, maxAge, minAge, isClosed, sortBy, pageNumber, pageSize } = req.query;
    const match = { 
      $or:[
        {"createdBy.userId": currentUser._id},//match bugs created by the current user
        {'assignedTo.userId': currentUser._id}//match bugs that are assigned to the currentUser
      ]
    }; 
    const sort = { creationDate: -1 }; // Sort default to newest, descending

    //check if  there are keywords in the query string and add them to the search filter
    if(keywords){
      match.$text = {$search: keywords};
    }

    // if there is a classification filter by it
    if (classification) {
      match.classification = classification;
    }

    // check if maxAge is provided and not falsy
    if (maxAge && maxAge > 0) {
      const maxAgeInDays = parseInt(maxAge);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeInDays);
      match.creationDate = { $gte: cutoffDate };
    }

    // check if minAge is provided and not falsy
    if (minAge && minAge > 0) {
      const minAgeInDays = parseInt(minAge);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - minAgeInDays);
      match.creationDate = { $lt: cutoffDate };
    }

    // check if open/close filter is selected
    if (isClosed && isClosed.toLowerCase() === 'true') {
      match.isClosed = true;
    } else if (isClosed && isClosed.toLowerCase() === 'false') {
      match.isClosed = false;
    }

    // if sortBy parameter is provided, adjust sorting accordingly
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
        // default to newest if sortBy value is invalid
        default:
          break;
      }
    }

    //set up the pagination/pagesize
    pageSize = parseInt(pageSize) || 5; // Default to 5 items/documents
    pageNumber = parseInt(pageNumber) || 1; // Default to page one

    //pipeline
    const pipeline = [
      { $match: match },
      { $sort: sort },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize }
    ];

    //connect to the database
    const db = await connect();
    const cursor = await db.collection("bugs").aggregate(pipeline);
    const totalCount = await db.collection('bugs').countDocuments(match);
    const bugs = await cursor.toArray();

    return res.status(200).json({ bugs, totalCount });
  } catch (error) {
    debugBug(error);
    return res.status(500).json({ message: 'Server Error.' });
  }
});


 
//get bug by id route
router.get(`/:bugId`, isLoggedIn(), hasPermission('canViewData'),async(req,res) => {
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
    return res.status(500).json({message: 'Internal Server Error.'})
  }
});


//bug creating route
router.post(`/new`,
[
  check('title', 'Title is required').isString(),
  check('description', 'Description is required').isString(),
  check('stepsToReproduce', 'Steps to reproduce is required').isString(),
]
,isLoggedIn(), hasPermission('canCreateBug'),async (req,res) => {
  
  const errors = validationResult(req.body);
  //check if there is any input validation
  if(!errors.isEmpty())
  {
    return res.status(400).json({errors: errors.array()});
  }

  debugBug(`bug create/new route hit`);

  try
  {
    //get the new bug from req.body
    const newBug = req.body;
    //get the current user
    const currentUser = req.auth;
    
    //creation date will be the current date and time
    newBug.creationDate = new Date();

    // set the creator of this bug as the logged in user/current user
    newBug.createdBy = {userId: new ObjectId(currentUser._id) , fullName: currentUser.fullName,  email: currentUser.email };
    //set the new bug as unclassified
    newBug.classification = 'Unclassified';
    newBug.isClosed = false; 

    //new bug will be initially assign to the current user
    newBug.assignedTo = {userId: new ObjectId(currentUser._id) , fullName: currentUser.fullName,  email: currentUser.email };
    
    const db = await connect(); // connect to db
    const bug = await db.collection("bugs").insertOne(newBug); // insert into bugs collection

    await addEditRecord(
      'bugs', //collection
      'insert',//operation
      bug.insertedId, //target id
      newBug, //update
      currentUser //auth
    );

    

    return res.status(200).json(`New bug reported! ${bug.insertedId}`);
  }
  catch(error)
  {
    return res.status(500).json({message: `Error in server.`});
  }
});


//bug update route
router.put(`/:bugId`, isLoggedIn(), 
  hasPermission('canEditAnyBug', "canEditIfAssignedTo", 'canEditMyBug'), async (req,res) => {

  //get the bugId from parameter path
  const bugId = req.params.bugId;

  //gets the input from body
  const updatedBug = req.body;
  const currentUser = req.auth;
  const permissions = req.auth.permissions;

  try{
    //connect to the db
    const db = await connect();
    const bug = await db.collection('bugs').findOne({_id: new ObjectId(bugId)}); // find the bug by its Id
    
    //users with  canEditAnyBug permission can edit any bug
    //users with permission canEditIfAssignedTo can edit bugs that they are assigned to
    //users with permission canEditMyBug can edit bugs that they created
    //check user permissions if they have ATLEAST one of these permissions
    //if they dont  throw an error and stop execution
    if(!((permissions.hasOwnProperty('canEditAnyBug')) || 
        (permissions.hasOwnProperty('canEditIfAssignedTo') && bug.assignedTo.userId == currentUser._id) ||
        (permissions.hasOwnProperty('canEditMyBug') && bug.createdBy.userId == currentUser._id))){
      return res.status(401).json({message: 'You are not authorized to edit this bug!'});
    }

    // check if bug exists in db
    if(!bug){
       res.status(404).json({message:'The bug does not exist'});
    }
  
    // add the last updated of current date
    updatedBug.lastUpdatedOn = new Date(); 
    //add who made the edit
    updatedBug.lastUpdatedBy = {userId: currentUser._id, fullName: currentUser.fullName, email: currentUser.email}; 
 

    const newBug = await db.collection("bugs").findOneAndUpdate(
      { _id : bug._id}, // search for this id
      {$set:{...updatedBug, _id: bug._id}} // set/update the fields to be changed
    );

    debugBug('updated',newBug)

    //add 
    await addEditRecord(
      "bugs",
      'update',
      bug._id,
      updatedBug,
      currentUser
    );
    // await updateBug(new ObjectId(bugId), updatedBug);
    return res.status(200).json({message: `Bug ${bugId} updated`});
    
  }
  catch(error){
    debugBug(error)
    return res.status(500).json({message: 'Server Error.'});
  }
});


//bug classification route
router.put(`/:bugId/classify`,
[
  check('classification').isString()
]
, isLoggedIn(), hasPermission('canClassifyAnyBug', 'canEditIfAssignedTo', 'canEditMyBug') , async(req,res) =>{
  debugBug(`classify route is hit.`);

  const errors = validationResult(req.body);
  if(!errors.isEmpty())
  {
    return res.status(400).json({errors: errors.array()});
  }

  try
  {
    const permissions = req.auth.permissions;
    const currentUser = req.auth;
    const bugClassification = req.body;


    //connect to the db
    const db = await connect();
    let bug = await db.collection('bugs').findOne({_id: new ObjectId(req.params.bugId)});

    //users with  canEditAnyBug permission can classify any bug
    //users with permission canEditIfAssignedTo can edit bugs that they are assigned to
    //users with permission canEditMyBug can edit bugs that they created
    //check user permissions if they have ATLEAST one of these permissions
    //if they dont  throw an error and stop execution
    if(!((permissions.hasOwnProperty('canClassifyAnyBug')) || 
        (permissions.hasOwnProperty('canEditIfAssignedTo') && bug.assignedTo.userId == currentUser._id) ||
        (permissions.hasOwnProperty('canEditMyBug') && bug.createdBy.userId == currentUser._id))){
      return res.status(401).json({message: 'You are not authorized to classify this bug!'});
    }

    //check if bug exist in db
    if (!bug)
    {
     return res.status(404).json({message: `Bug does not exist.`});
    }
    //set classification
    else
    {
      bug.classification = bugClassification.classification;
      bug.classifiedOn = new Date();
      bug.lastUpdated =  new Date();
      bug.classifiedBy = {userId: currentUser._id, fullName: currentUser.fullName, email:  currentUser.email};

      
      const classifiedBug = await db.collection("bugs").findOneAndUpdate(
        { _id : new ObjectId(bug._id)},
        {$set: bug},
      );

      await addEditRecord(
        'bugs', //collection
        'update' ,//operation
        classifiedBug._id, //targetId
        classifiedBug, //updated  document
        currentUser   //edited by user
      );
      
      return res.status(200).json({message:`Bug  with id ${req.params.bugId} has been classified.`});
    }
  }
  catch(error){
    debugBug(error)
    return res.status(500).json({message: "Internal Server Error"})
  }

});

//assign user to a bug route
router.put(`/:bugId/assign`,
[
  check('assignTo', 'Please provide valid User ID').isString(),
],isLoggedIn(), hasPermission('canReassignIfAssignedTo', 'canReassignAnyBug', 'canEditMyBug') , async(req,res) => {
 
  const errors = validationResult(req.body);
  if(!errors.isEmpty())
  {
    return res.status(400).json({message: errors.array()});
  }
  debugBug('Assigning user to the Bug')
  try
  {

    const currentUser = req.auth;
    const bugId = req.params.bugId;
    const assignTo = req.body.assignTo;
    const permissions = req.auth.permissions;

    //connect to db
    const db = await connect();

    //check if current user selected a user who the bug will be assigned to
    if(!assignTo){
      return res.status(400).json({message: 'Please select a user to Assign.'})
    }
    
    //get the user to assign to the bug
    const userToAssign = await db.collection("users").findOne(
      {_id : new ObjectId(assignTo)},
      {projection: {password: 0}}
    );
    //check if the  user exists in the database
    if(!userToAssign){
      return res.status(404).json({message: 'User to assigned to does not exist.'});
    }

    //get the bug from the db
    const bug = await db.collection("bugs").findOne({_id : new ObjectId(bugId)});
    //check if bug exist in db
    if(!bug)
    {
      return res.status(404).json({ message : `No Bug found with the id ${bugId}` });
    }

    //users with  canReassignAnyBug permission can re-assign any bug
    //users with permission canReassignIfAssignedTo can re-assign bugs that they are assigned to
    //users with permission canEditMyBug can re-assign bugs that they created
    //check user permissions if they have ATLEAST one of these permissions
    //if they dont  throw an error and stop execution
    if(!((permissions.hasOwnProperty('canReassignAnyBug')) || 
        (permissions.hasOwnProperty('canReassignIfAssignedTo') && bug.assignedTo.userId == currentUser._id) ||
        (permissions.hasOwnProperty('canEditMyBug') && bug.createdBy.userId == currentUser._id))){
      return res.status(401).json({message: 'You are not authorized to edit this bug!'});
    }
    //if bug exist, assign the userToAssign
    else
    {

      bug.assignedTo= {userId: userToAssign._id, fullName: userToAssign.fullName, email: userToAssign.email};
      bug.assignedBy = {userId: currentUser._id, fullName: currentUser.fullName, email: currentUser.email};
      bug.assignedOn = new Date();
      bug.lastUpdated =  new Date();

      const  updatedBug = await db.collection("bugs").findOneAndUpdate(
        { _id : new ObjectId(bugId)},
        {$set : bug}
      );

      await addEditRecord(
        'bugs',//collection
        'update',//operation
        updatedBug._id, // targetId
        bug, 
        currentUser
      );
      return res.status(200).send("Assign Successful");
    }
  }
  catch(error){
    debugBug(error)
    return res.status(500).json({message: `Internal Server Error! ${error}`})
  }
});

//bug close route
router.put(`/:bugId/close-open`,
[
  check('isClosed', `Please type 'close' to close this bug`).isString()
]
,isLoggedIn(), hasPermission('canCloseAnyBug'),async(req,res) =>{
  
  const errors = validationResult(req);
  if(!errors.isEmpty())
  {
    return res.status(400).json({errors: errors.array()});
  }

  try{
    const permissions = req.auth.permissions;
    if(!permissions.hasOwnProperty('canCloseAnyBug')){
      debugBug('nooooo')
      return res.status(401).json({message: 'You are not authorized to Close/Open a bug.!'});
    };

    //connect to db
    const db = await connect();
    const bug = await db.collection('bugs').findOne({_id : new ObjectId(req.params.bugId)});

    //if  no bug is found send error message
    if(!bug)
    {
      return res.status(404).json({ message : `No Bug found with the id ${req.params.bugId}` });
    }
    else
    {
      const currentUser = req.auth;
      let {isClosed} = req.body;
      debugBug(isClosed)
      //if isClosed === 'true', set the isClosed to true, otherwise false
       isClosed = isClosed === 'true' ? true : false;
      
      if(isClosed)
      { 
        bug.closedOn = new Date();
        bug.isClosed = true;
        bug.closedBy = currentUser;
      }
      else{
        bug.closedOn = null;
        bug.isClosed = false;
        bug.closedBy = null;
      }
      
      const updatedBug = await db.collection('bugs').findOneAndUpdate(
        {_id: new ObjectId(bug._id)},
        {$set: bug}); 

      //add edit document
      await addEditRecord(
        'bugs', //collection
        'update', //op
        bug._id,  //targetId
        updatedBug, //data
        currentUser //editor
      );
      
      if(isClosed){
        return res.status(200).json({message: `Bug ${req.params.bugId} has been closed`});
      }
      else{
        return res.status(200).json({message: `Bug ${req.params.bugId} has been re-open`});
      }
    }
  }
  catch(error){
    return res.status(500).json({message: `'Internal Server Error!' ${error}`})
  }
});


//add   comment to a bug
router.put(`/:bugId/comment/new`,isLoggedIn(), hasPermission('canAddComments') ,async(req,res)=>
{
   //comment schema
   const commentSchema = Joi.object({
    commentText: Joi.string().trim().required().messages({
      'string.empty': 'Comment cannot be empty.',
      'any.required': 'Comment is required.',
    }),
   });
   
   //validate the input
   const {error}= commentSchema.validate(req.body);
   if (error)  
   {
     console.log('Error in validation', error);
     return res.status(400).json({ error: error.details[0].message});
   }

  try {
    const author = req.auth;
    const newComment = req.body;
    newComment.createdOn = new Date();
    newComment.author = {userId: author._id, fullName: author.fullName, email: author.email};

    // open a db connection
    const db = await connect();

    //get the bug from the db
    const bug = await db.collection('bugs').findOne({_id : new ObjectId(req.params.bugId)});
    
    //check if bug exists
    if(!bug){
      return res.status(404).json({message: 'No Bug Found...'});
    }

    // add the comment to the  database
    const comment = await db.collection("comments").insertOne({bugId: new ObjectId(bug._id) , ...newComment});

    return res.status(200).json({message:`Comment  added successfully! ${comment.insertedId}`});
  } 
  catch (error) {
    debugBug(error)
    return res.status(500).json({message: 'Server Error.'});
  }
});


//get a comment  by its ID
router.get(`/:bugId/comment/:commentId`, isLoggedIn(),  hasPermission('canViewData') ,async (req,res)=>{
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
router.get(`/:bugId/comments/list`, isLoggedIn(), hasPermission('canViewData') , async(req,res)=>
{
  debugBug('comment list hit route')
  try {

    let {pageNumber, pageSize} = req.query;

    pageSize = parseInt(pageSize) || 5; // default the page size to 5
    pageNumber = parseInt(pageNumber) || 1; //defaults the page number to 1

    const match = {
      "bugId":new ObjectId(req.params.bugId),
    }

    const pipeline = [
      {$match: match},
      {$sort: {createdOn: -1}},
      {$skip: (pageNumber - 1) * pageSize},
      {$limit: pageSize}
    ];

    //open a db connection
    const db = await connect();
    const cursor = await db.collection("comments").aggregate(pipeline);
    const totalCount = await db.collection("comments").countDocuments(match);
    //find the comments for this bug id from the collection
    const comments = await cursor.toArray();



    return res.status(200).json({
        comments,
        totalCount
    });
    
  } 
  catch (error) {
    debugBug(error)
    return res.status(500).json({message: `Server Errors.`});
  }
});


//add tests cases to a bug 
router.put('/:bugId/test/new', isLoggedIn(), hasPermission('canAddTestCase'),async(req,res)=>
{
  try {
    //test case schema
    const testCaseSchema = Joi.object({
      testTitle :Joi.string().required().messages({ 'any.required': 'Test title field cannot be empty'}),
      expectedOutput :Joi.string().required().messages({ 'any.required': 'Test output field cannot be empty'}),
      result: Joi.string().valid('passed','failed').required().messages({'any.required': 'Test result is required, must be passed or failed.'}),
      testedAt:  Joi.date().iso().default(new Date()),
    });

    const {error} = testCaseSchema.validate(req.body);

    //check if there is error on input/req.body
    if(error){
      console.log('Error in validation', error);
       return res.status(400).json({ message: error.details[0].message });
    }
    else{ //if there is no error, add the new bug test to db
      const newTest = req.body;
      //get the currentUser
      const currentUser = req.auth;


      //open db connection
      const db = await connect();

      //get the bug from the db
      const bug = await db.collection("bugs").findOne({_id: new ObjectId(req.params.bugId)});

      //check if bug exists
      if(!bug){
        return res.status(404).json({message: 'No Bug Found...'});
      }

      //add the date when it was created
      newTest.createdOn = new Date();
      newTest.createdBy =  currentUser;

      //add the new test to db
      const newTestCase = await db.collection("tests").insertOne({bugId: new ObjectId(req.params.bugId), ...newTest});

      // Get the inserted test case by its _id
      const insertedTestCase = await db.collection("tests").findOne({ _id: newTestCase.insertedId });

      //add edit document for this test for tracking
      await addEditRecord(
        "tests",
        'insert',
        insertedTestCase._id,
        insertedTestCase,
        currentUser
      );
      
      return res.status(200).json({message: `New Test Case for the bug ${req.params.bugId} successfully added. ${insertedTestCase._id}`});
    }
  } 
  catch (error) {
    return res.status(500).json({message: 'Server Error.'});
  }
});

//update a test
router.put('/:bugId/test/:testId', isLoggedIn(),hasPermission('canEditTestCase'),async(req,res)=>
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

      //get the current user
      const currentUser = req.auth;

      //set the updated test
      updatedTest.updatedAt = new Date();
      updatedTest.lastUpdatedBy = currentUser; 

      //update the test
      const updatedResult = await  db.collection("tests").findOneAndUpdate(
        {_id : test._id},
        {$set: updatedTest}
      );

      //add records to edits
      await addEditRecord(
        'tests',
        'update',
        updatedResult._id,
        updatedResult,
        currentUser
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
router.get('/:bugId/test/:testId',isLoggedIn() ,hasPermission('canViewData'),async(req,res)=>{
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
router.get('/:bugId/tests/list', isLoggedIn(), hasPermission('canViewData'), async (req,res)=>
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
router.delete('/:bugId/test/:testId', isLoggedIn(), hasPermission('canDeleteTestCase'), async(req,res)=>
{
  try {
    //open db connection
    const db=await connect();

    //get the current user
    const currentUser = req.auth;

    //find the test from db and delete it
    const  deletedTest = await db.collection('tests').findOneAndDelete({
      _id:new ObjectId(req.params.testId), 
      bugId: new ObjectId(req.params.bugId),
    });
  
    //check if it was deleted  or not
    if (!deletedTest) {
       return res.status(404).json({message: `No test found.`});
    }
    else{
      //add edit collections to db
      await addEditRecord(
        'tests',
        'delete',
        deletedTest._id,
        deletedTest,
        currentUser
      );

      return res.status(200).json({message:`Test deleted successfully`});
    }
    
  } 
  catch (error) {
    debugBug(error)
    return res.status(500).json({ message: "Server error" });
  }
});


export{router as bugRouter};