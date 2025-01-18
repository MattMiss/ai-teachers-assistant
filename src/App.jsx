import { useState, useEffect } from 'react';

function App() {
    const [criteria, setCriteria] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        console.log(file);
    }, [file]);

    const handleFileUpload = (event) => {
        setFile(event.target.files[0]);
        alert(`File uploaded: ${event.target.files[0]?.name || 'No file selected'}`);
    };

    const handleCriteriaSubmit = () => {
        if (criteria) {
            alert(`Criteria submitted: ${criteria}`);
        } else {
            alert('Please enter criteria');
        }
    };

    return (
        <div className="container">
            <h1>AI Feedback System</h1>

            {/* File Upload Section */}
            <div className="upload-section">
                <label htmlFor="file-upload">Upload CSV File:</label>
                <input
                    type="file"
                    id="file-upload"
                    accept=".csv"
                    onChange={handleFileUpload}
                />
                <button className="upload-btn" onClick={() => alert('Placeholder for file upload logic')}>
                    Upload File
                </button>
            </div>

            {/* Criteria Input Section */}
            <div className="criteria-section">
                <label htmlFor="criteria-input">Enter AI Feedback Criteria:</label>
                <input
                    type="text"
                    id="criteria-input"
                    placeholder="e.g., clarity, content depth, structure"
                    value={criteria}
                    onChange={(e) => setCriteria(e.target.value)}
                />
                <button className="submit-btn" onClick={handleCriteriaSubmit}>
                    Submit Criteria
                </button>
            </div>

            {/* Results Section */}
            <div className="result-section">
                <h2>AI Feedback Results</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Answer</th>
                            <th>AI Feedback</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Example dynamic content */}
                        <tr>
                            <td>Alice</td>
                            <td>The Industrial Revolution changed society by...</td>
                            <td>Social changes were a key theme.</td>
                        </tr>
                        <tr>
                            <td>Bob</td>
                            <td>The key factors of the Industrial Revolution were...</td>
                            <td>Mechanization and urbanization were critical.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default App;
