import {useQuery} from  "react-query";
import * as apiClient from '../api-client'

const Bugs =()=>
{

  const {data:bugs} = useQuery('getAllBugs',apiClient.getAllBugs,
  {
    onError:(error) => alert("Failed to load bugs", error)
  });

  if(!bugs) return <div>Loading...</div>;

  return(
  <div>
   <h1>Bugs</h1>
      <ul>
        {bugs.map(bug => (
          <li key={bug._id}>
            <h2>{bug.title}</h2>
            <p>Description: {bug.description}</p>
            <p>Steps to Reproduce: {bug.stepsToReproduce}</p>
            {/* Add additional fields as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Bugs;