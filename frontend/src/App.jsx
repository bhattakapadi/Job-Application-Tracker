import { useState } from 'react';
import JobForm from './components/JobForm';
import JobList from './components/JobList';

/* recap:
  refresh : piece of state
  setRefresh: function that changes the state

  aim: whe the setRefresh(newvalue), react re-renders the app component and updates any child component, that depends 
  on that state

*/
function App() {
  const [refresh, setRefresh] = useState(0);

  const handleJobAdded = () => {
    setRefresh(prev => prev + 1);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>Job Application Tracker</h1>
      <JobForm onJobAdded={handleJobAdded} />
      <JobList refresh={refresh} />
    </div>
  );
}

export default App;