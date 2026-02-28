import { useState } from 'react';
import axios from 'axios';

const API_URL = '/api/jobs';

function JobForm({ onJobAdded }) {
  const [formData, setFormData] = useState({
    company_name: '',
    position: '',
    job_url: '',
    salary_wished: '',
    current_status: 'Applied',
  });

  const [jobDescription, setJobDescription] = useState('');
  const [motivationLetter, setMotivationLetter] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [jobDescFile, setJobDescFile] = useState(null);
  const [motivationFile, setMotivationFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      
      // Append text or file for job description
      if (jobDescFile) data.append('job_description', jobDescFile);
      else data.append('job_description', jobDescription);

      // Append text or file for motivation letter
      if (motivationFile) data.append('motivation_letter', motivationFile);
      else data.append('motivation_letter', motivationLetter);

      // Append CV file
      if (cvFile) data.append('cv', cvFile);

      await axios.post(API_URL, data);
      alert('Job application added!');
      onJobAdded(); // refresh the list
    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <h2>Add Job Application</h2>

      <div>
        <label>Company Name *</label><br />
        <input name="company_name" value={formData.company_name} onChange={handleChange} required />
      </div>

      <div>
        <label>Position</label><br />
        <input name="position" value={formData.position} onChange={handleChange} />
      </div>

      <div>
        <label>Job URL</label><br />
        <input name="job_url" value={formData.job_url} onChange={handleChange} />
      </div>

      <div>
        <label>Salary Wished</label><br />
        <input name="salary_wished" value={formData.salary_wished} onChange={handleChange} />
      </div>

      <div>
        <label>Status</label><br />
        <select name="current_status" value={formData.current_status} onChange={handleChange}>
          <option>Applied</option>
          <option>Interview</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
      </div>

      <div>
        <label>Job Description (text or PDF)</label><br />
        <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={3} placeholder="Paste job description here..." />
        <br />
        <input type="file" accept=".pdf" onChange={e => setJobDescFile(e.target.files[0])} />
      </div>

      <div>
        <label>Motivation Letter (text or PDF)</label><br />
        <textarea value={motivationLetter} onChange={e => setMotivationLetter(e.target.value)} rows={3} placeholder="Paste motivation letter here..." />
        <br />
        <input type="file" accept=".pdf" onChange={e => setMotivationFile(e.target.files[0])} />
      </div>

      <div>
        <label>CV (PDF)</label><br />
        <input type="file" accept=".pdf" onChange={e => setCvFile(e.target.files[0])} />
      </div>

      <br />
      <button type="submit">Submit Application</button>
    </form>
  );
}

export default JobForm;