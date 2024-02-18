
import express from 'express';

const router = express.Router();
import debug from "debug";
const debugBug = debug(`app:BugRouter`);

const bugsArr = [
  { bugID: 1, 
    bugName: `Curson Don't Work!`,  
    description: `The cursor on the website is broken.`,
    stepsToReproduce:`IDK`,
    classification: `none`,
    bugCreationDate: Date(),
    bugUpdateDate:Date(),
    bugCloseDate:Date()},

  { bugID: 2, 
    bugName:`404 Error When Clicking Links`,
    description:`When clicking any links in this site I get a 404 error.`,
    stepsToReproduce:`IDK`,
    classification: `none`,
    bugCreationDate: Date(),
    bugUpdateDate:Date(),
    bugCloseDate:Date()},

  { bugID: 3,
    bugName: `Site Crashes When Opening Home Page`,
    description:`When opening the home page of our site, the browser crashes.`,
    stepsToReproduce:`IDK`,
    classification: `none`,
    bugCreationDate: Date(),
    bugUpdateDate:Date(),
    bugCloseDate:Date()
  }
];

//bugs list route
router.get(`/list`,(req,res) => {
  debugBug(`bug list route hit`);
  return res.json(bugsArr);
});

//get bug by id route
router.get(`/:bugID`, (req,res) => {
  const id = req.params.bugID;
  debugBug(`get by id for bugs`);
  //FIXME: get bug from bugsArr and send response as JSON

  //find the passed in id in bugsArr
  const foundBug = bugsArr.find(bug => bug.bugID == id);
  if(foundBug)
  {
    debugBug(`bug found id ${foundBug.bugID}`);
    return res.status(200).json(foundBug);
  }
  //else if found bug is null, send error message
  else
  {
    debugBug(` did not found id ${foundBug.bugID}`);
    return res.status(404).type(`text/plain`).send(`Bug ${id} not found`);
  }
});


//bug creating route
router.post(`/new`, (req,res) => {
  //FIXME: create new bug and send response as J
  debugBug(`bug create/new route hit`);
  const newBug = req.body;

  //add a unique id for the new bug
  newBug.bugID = bugsArr.length + 1;

  //check user input if all fields are filled
  if(!newBug.title)
  {
     res.status(400).type('text/plain').send("Missing title.");
  }
  else if(!newBug.description)
  {
    res.status(400).type('text/plain').send("Missing description.");
  }
  else if(!newBug.stepsToReproduce)
  {
    res.status(400).type('text/plain').send("Missing Steps To Reproduce.");
  }
  else
  {
    debugBug(`all fields are filled for creating  a new bug(bug will be created).`);
    newBug.bugCreationDate = Date(); // add a creation date  to the new bug object
    bugsArr.push(newBug); // push the  new bug into our array of bugs
    res.status(200).json({message: `New  Bug added with ID: ${newBug.bugID}`, bug: newBug});
  }
  
});


//bug update route
router.put(`/:bugID`, (req,res) => {
  //get the bugID from parameter path
  const id = req.params.bugID;

  //gets the input from body
  const updatedBug = req.body;

  //find the bug from the array
  const  bugToBeUpdated = bugsArr.find(b => b.bugID == id);

  // if it passed in id is found, update it with the body input/s
  if(bugToBeUpdated)
  {
    debugBug(`found bug id: ${id}`);
    for(const  key in updatedBug)
    {
      bugToBeUpdated[key] = updatedBug[key];
      bugToBeUpdated.bugUpdateDate = Date();
    }

    const index = bugsArr.findIndex(b => b.bugID == id);

    if(index != -1)
    {
      bugsArr[index] = bugToBeUpdated;
    }

    debugBug(`Bug with id ${id} updated successfully`);
    res.status(200).type(`text/plain`).send(`Bug with id:${id} successfully updated.`);
  }
  //else if bugID isn't found, send error message
  else
  {
    debugBug(`Bug with id ${id} is  not found.`);
    res.status(404).type(`text/plain`).send(`Can't find the bug.`);
  }

});


//bug classification route
router.put(`/:bugID/classify`,(req,res) =>{
  debugBug(`classify route is hit.`);

  const id = req.params.bugID;

  const classifyBug = req.body;

  //get the bug from the DB/array
  const findBUG = bugsArr.find(b => b.bugID == id);

  if(!findBUG)
  {
    debugBug(`Can't find the bug.`);
     res.status(404).type(`text/plain`).send(`The bug with id:${id} was not found.`) ;
  }
 else if(!classifyBug.classification)
 {
  res.status(400).type(`text/plain`).send(`Classification must be provided.`)
 }
 else
 {
  findBUG.classification = classifyBug.classification
  findBUG.classifiedOn = Date();
  findBUG.bugUpdateDate = Date();
  res.status(200).type(`text/plain`).send(`Bug with id:${id} has been classified.`)
  debugBug(`Bug has been classified as ${findBUG.classification}`)
 }

});

//assign user to a bug route
router.put(`/:bugID/assign`,(req,res) => {
  const id = req.params.bugID;
  const userToAssign = req.body;

  //find the bug using bugID
  const foundBug = bugsArr.find(b => b.bugID == id);

  if(!foundBug) // if cant find the bug from array, send error message
  {
    debugBug(`can't find the bug`);
    res.status(404).type(`text/plain`).send(`Can't find Bug with id:${id}.`);
  }
  //if username or userid is not provided, send error message
  else if(userToAssign.assignedToUserId == null ||  userToAssign.assignedToUserName == null )
  {
    debugBug("No Username or User ID Provided");
    res.status(400).type(`text/plain`).send(`UserID and UserName should be provided.`);
  }
  else
  {
    // fill the information
    foundBug.assignedToUserId = userToAssign.assignedToUserId;
    foundBug.assignedToUserName =  userToAssign.assignedToUserName;
    foundBug.assignedOn= Date();
    foundBug.bugUpdateDate = Date();

    debugBug(`User ID ${userToAssign.assignedToUserId} has been assigned to bug id ${foundBug.bugID}`);
    
    res.status(200).type(`text/plain`).send(`Bug assigned!`);
  }


});

//bug close route
router.put(`/:bugID/close`,(req,res) =>{
  const id = req.params.bugID;
  const  closed = req.body;

  const foundBug = bugsArr.find(b => b.bugID == id);

  //if bug isnt found in array, send error message
  if(!foundBug)
  {
    debugBug(`can't find the bug`);
    res.status(404).type(`text/plain`).send(`Bug  with id:${id} doesn't exist.`);
  }
  else if(closed.close === null || closed.close !== `close`)
  {
    debugBug('Close input missing');
    res.status(400).type(`text/plain`).send(`"close" must be typed-in to  close a bug.`);
  }
  else
  {
    if(closed.close == `close`)
    {
      debugBug('bug closed');
      foundBug.isClosed = true;
      foundBug.closedOn = Date();
      foundBug.bugUpdateDate = Date();
      res.status(200).type('text/plain').send(`BUG ID:${id} HAS BEEN CLOSED!`);
    }
  }

});

export{router as bugRouter};