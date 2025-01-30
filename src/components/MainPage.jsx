import { useState } from "react";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import "../index.css"; // Import the CSS file

// Import AI utilities
import { fetchOllamaResponse } from "../utils/api";
import { generatePrompt } from "../utils/ai";

const MainPage = () => {
    const [criteria, setCriteria] = useState("");
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [anonymizedData, setAnonymizedData] = useState([]);
    const [mapping, setMapping] = useState([]);
    const [aiResults, setAiResults] = useState([]);
    const [finalResults, setFinalResults] = useState([]);
    const [error, setError] = useState("");

    // Step 1: Handle file upload
    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        setParsedData([]); // Clear previous data
        setAnonymizedData([]);
        setMapping([]);
        setAiResults([]);
        setFinalResults([]);
        setError(""); // Clear previous error

        if (uploadedFile && uploadedFile.type === "text/csv") {
            setFile(uploadedFile);
            parseCSV(uploadedFile);
        } else {
            setFile(null);
            showError("Please upload a valid CSV file.");
        }
    };

    // Step 2: Parse CSV and sanitize
    const parseCSV = (file) => {
        Papa.parse(file, {
            complete: (result) => {
                if (result.data && result.data.length > 0) {
                    sanitizeData(result.data); // Remove sensitive columns
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

    // Step 3: Remove identifying columns and anonymize
    const sanitizeData = (data) => {
        const identifyingColumns = ["Name", "Student ID", "sis_id", "root_account", "section", "section_id", "section_sis_id"];
        const tempData = [];
        const idMapping = [];
        const questionsMap = {};
    
        data.forEach((row, index) => {
            const tempID = `temp-${index + 1}`;
            const anonymizedRow = { tempID };
    
            Object.keys(row).forEach((key) => {
                if (!identifyingColumns.includes(key)) {
                    anonymizedRow[key] = row[key];
                }
            });
    
            idMapping.push({
                tempID,
                original: identifyingColumns.reduce((acc, col) => {
                    acc[col] = row[col];
                    return acc;
                }, {}),
            });
    
            tempData.push(anonymizedRow);
        });
    
        // Transform the data into formattedTestData.js structure
        const formattedData = {
            questions_and_answers: [],
        };
    
        tempData.forEach((row) => {
            Object.keys(row).forEach((key) => {
                // Identify if the key is a question (it usually contains a long text prompt)
                if (key.match(/^\d+/)) {
                    const questionText = key;
                    const answerText = row[key];
    
                    if (!questionsMap[questionText]) {
                        questionsMap[questionText] = {
                            question: questionText,
                            answers: [],
                        };
                    }
    
                    questionsMap[questionText].answers.push({
                        userId: row.tempID,
                        response: answerText,
                    });
                }
            });
        });
    
        formattedData.questions_and_answers = Object.values(questionsMap);
    
        setParsedData(data);
        setAnonymizedData(formattedData); // Store formatted data
        setMapping(idMapping);
    };
    

    // Step 4: Send anonymized data and criteria to AI
    const sendToAI = async () => {
        if (anonymizedData.length === 0 || !criteria) {
            alert("Please ensure you upload a CSV file and provide criteria.");
            return;
        }

        const prompt = generatePrompt(anonymizedData, criteria);

        try {
            const response = await fetch("http://localhost:11434/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama3.2", 
                    prompt,
                }),
            });

            if (response.ok) {
                const reader = response.body.getReader();
                let resultText = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = new TextDecoder("utf-8").decode(value);
                    const result = JSON.parse(chunk);
                    resultText += result.response || "";
                }

                const aiResults = parseAIResponse(resultText); // Parse AI output
                setAiResults(aiResults);

                reattachOriginalData(aiResults); // Merge AI results with original data
            } else {
                const errorText = await response.text();
                showError(`AI API Error: ${errorText}`);
            }
        } catch (error) {
            showError(`Failed to connect to AI: ${error.message}`);
        }
    };

    // Step 5: Generate AI prompt(From ai.js)

    // Step 6: Parse AI Response
    const parseAIResponse = (responseText) => {
        const lines = responseText.split("\n").filter((line) => line.trim() !== "");
        return lines.map((line, index) => {
            const [tempID, feedback] = line.split(":");
            return { tempID: tempID.trim(), feedback: feedback.trim() };
        });
    };

    // Step 7: Reattach original data
    const reattachOriginalData = (aiResults) => {
        const mergedResults = aiResults.map((result) => {
            const originalData = mapping.find((map) => map.tempID === result.tempID);
            return {
                ...originalData.original,
                ...result,
            };
        });

        setFinalResults(mergedResults);
    };

    // Step 8: Display error
    const showError = (message) => {
        setError(message);
        document.getElementById("file-upload").value = ""; // Clear the file input
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
                <button className="submit-btn" onClick={sendToAI}>
                    Submit Criteria
                </button>
            </div>

            {/* Results Section */}
            <div className="result-section">
                <h2>AI Feedback Results</h2>
                {finalResults.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                {Object.keys(finalResults[0]).map((key) => (
                                    <th key={key}>{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {finalResults.map((row, index) => (
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
