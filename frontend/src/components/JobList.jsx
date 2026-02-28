import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/jobs';

function JobList({ refresh }) {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, [refresh]);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(API_URL);
      setJobs(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { current_status: newStatus });
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Job Applications</h2>
      {jobs.length === 0 ? (
        <p>No applications yet. Add one above!</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Company</th>
              <th>Position</th>
              <th>Job URL</th>
              <th>Salary Wished</th>
              <th>Status</th>
              <th>Date Applied</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id}>
                <td>{job.company_name}</td>
                <td>{job.position}</td>
                <td>
                  {job.job_url ? (
                    <a href={job.job_url} target="_blank" rel="noreferrer">Link</a>
                  ) : 'N/A'}
                </td>
                <td>{job.salary_wished || 'N/A'}</td>
                <td>
                  <select
                    value={job.current_status}
                    onChange={e => handleStatusChange(job.id, e.target.value)}
                  >
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Offer</option>
                    <option>Rejected</option>
                  </select>
                </td>
                <td>{new Date(job.created_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(job.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default JobList;