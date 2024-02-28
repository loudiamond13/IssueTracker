
import express from 'express';
const router = express.Router();
import debug from "debug";
import { getAllBugs,getBugByID,createBug,updateBug,getUserByID } from '../../database.js';
import { ObjectId } from 'mongodb';
import { check, validationResult } from 'express-validator';
const debugBug = debug(`app:BugRouter`);


//bugs list route
router.get(`/list`, async(req,res) => {
  const bugs = await getAllBugs();
  debugBug(`bug list route hit`);
   res.json(bugs);
});

//get bug by id route
router.get(`/:bugID`, async(req,res) => {
  try
  {
    const bug = await getBugByID(new ObjectId(req.params.bugID)); // get the bug  with this params ID

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
router.put(`/:bugID`, async (req,res) => {
  //get the bugID from parameter path
  const bugID = req.params.bugID;

  //gets the input from body
  const updatedBug = req.body;
  try
  {
    updatedBug.lastUpdated = new Date(); // add the last updated of current date

    const bug = await getBugByID(new ObjectId(bugID)); // check if bug exists in db

    if(!bug)
    {
       res.status(404).json('The bug does not exist');
    }
    else
    {
      await updateBug(new ObjectId(bugID), updatedBug);
      return res.status(200).json({message: `Bug ${bugID} updated`, bugID});
    }
  }
  catch(error)
  {
    return res.status(500).json({message: 'Server Error.'});
  }
});


//bug classification route
router.put(`/:bugID/classify`,
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
    let bug = await getBugByID(new ObjectId(req.params.bugID));

    //check if bug exist in db
    if (!bug)
    {
     return res.status(404).json({message: `Bug with id ${req.params.bugID} does not exist.`});
    }
    //set classification
    else
    {
      bug.classification = bugClassification.classification;
      bug.classifiedOn = new Date();
      bug.lastUpdated =  new Date();

      await updateBug(new ObjectId(req.params.bugID), bug);
      return res.status(200).json({message:`Bug  with id ${req.params.bugID} has been classified.`});
    }
  }
  catch(error)
  {
    return res.status(500).json({message: "Internal Server Error"})
  }

});

//assign user to a bug route
router.put(`/:bugID/assign`,
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
    
    const bugID = req.params.bugID;
    const assignToUser = req.body;

    let bug = await getBugByID(new ObjectId(bugID));
    const  assignedUser = await getUserByID(new ObjectId(assignToUser.assignedToUserId));
    //check if bug exist in db
    if(!bug)
    {
      return res.status(404).json({ message : `No Bug found with the id ${bugID}` });
    }
    //if bug exist, assign a user
    else
    {
      bug.assignedToUserId = assignToUser.assignedToUserId;
      bug.assignToUserName = assignedUser.fullName; 
      bug.assignedOn = new Date();
      bug.lastUpdated =  new Date();

      await updateBug(new ObjectId(bugID), bug);
      return res.status(200).send("Assign Successful");
    }

  }
  catch(error)
  {
    return res.status(500).json({message: `Internal Server Error! ${error}`})
  }

});

//bug close route
router.put(`/:bugID/close`,
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
    let bug = await getBugByID(new ObjectId(req.params.bugID));

    //if  no bug is found send error message
    if(!bug)
    {
      return res.status(404).json({ message : `No Bug found with the id ${req.params.bugID}` });
    }
    else
    {
      const isClosed = req.body;
      if(isClosed.closed == `close`)
      {
        bug.closedOn = new Date();
        bug.isClosed = true;
        bug.lastUpdated = new Date();

        await updateBug(new ObjectId(req.params.bugID),bug);
        return res.status(200).json({message: `Bug ${req.params.bugID} has been closed`});
      }
    }
  }
  catch(error)
  {
    return res.status(500).json({message: `'Internal Server Error!' ${error}`})
  }
  

});

export{router as bugRouter};