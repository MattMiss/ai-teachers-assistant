import { useState } from "react";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import "../index.css"; // Import the CSS file

const MainPage = () => {
    const [criteria, setCriteria] = useState("");
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [error, setError] = useState("");

    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        setParsedData([]); // Clear previous data
        setError(""); // Clear previous error

        if (uploadedFile && uploadedFile.type === "text/csv") {
            setFile(uploadedFile);
            parseCSV(uploadedFile);
        } else {
            setFile(null);
            showError("Please upload a valid CSV file.");
        }
    };

    const parseCSV = (file) => {
        Papa.parse(file, {
            complete: (result) => {
                if (result.data && result.data.length > 0) {
                    setParsedData(result.data); // Store parsed JSON data
                } else {
                    showError("The CSV file is empty or improperly formatted.");
                }
            },
            header: true, // Ensures the first row is used as keys
            skipEmptyLines: true,
            error: (error) => {
                showError("Error parsing CSV file: " + error.message);
            }
        });
    };

    const showError = (message) => {
        setError(message);
        // Clear the file input to allow re-upload
        document.getElementById("file-upload").value = "";
    };

    const handleCriteriaSubmit = () => {
        if (criteria) {
            alert(`Criteria submitted: ${criteria}`);
        } else {
            alert("Please enter criteria");
        }
    };

    return (
        <div className="container">
            <h1>AI Feedback System</h1>
            <nav>
                <Link to="/test" className="nav-link">
                    Go to Test Page
                </Link>
            </nav>

            {/* File Upload Section */}
            <div className="upload-section">
                <label htmlFor="file-upload">Upload CSV File:</label>
                <input
                    type="file"
                    id="file-upload"
                    accept=".csv"
                    onChange={handleFileUpload}
                />
            </div>

            {/* Error Pop-up */}
            {error && (
                <div className="error-popup">
                    <div className="error-content">
                        <span className="close-btn" onClick={() => setError("")}>&times;</span>
                        <p>{error}</p>
                    </div>
                </div>
            )}

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
                {parsedData.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                {Object.keys(parsedData[0]).map((key) => (
                                    <th key={key}>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {parsedData.map((row, index) => (
                                <tr key={index}>
                                    {Object.values(row).map((value, idx) => (
                                        <td key={idx}>{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No data to display.</p>
                )}
            </div>
        </div>
    );
};

export default MainPage;