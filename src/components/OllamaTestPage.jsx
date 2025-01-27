import { useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import formattedTestData from "../data/formattedTestData";
//import { generatePrompt } from "../utils/ai";
import { ollamaApiLocal, fetchOllamaResponse } from "../utils/api";
import { batchQuestions, generatePromptForBatch } from "../utils/ai";

const OllamaTestPage = () => {
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [apiUrl] = useState(ollamaApiLocal);
    const [model, setModel] = useState("deepseek-r1:1.5b");

    // const handleTestOllama = async () => {
    //     setLoading(true);
    //     setError("");
    //     setResponse("");
        
    //     const prompt = generatePrompt(formattedTestData);

    //     await fetchOllamaResponse(
    //         apiUrl, 
    //         model, 
    //         prompt, 
    //         (newResponse) => setResponse(newResponse),  // Update response progressively
    //         (errorMessage) => {
    //             setError(errorMessage);  // Set the error message while keeping the response
    //             setLoading(false);
    //         },
    //         () => setLoading(false) 
    //     );
    // }
    
    const handleTestBatchedOllama = async () => {
        setLoading(true);
        setError("");
        setResponse("");
    
        const batchedQuestions = batchQuestions(formattedTestData.questions_and_answers, 5); // Batch size = 5 questions
        console.log("BatchedQuestions: ", batchedQuestions);
    
        try {
            for (const [index, batch] of batchedQuestions.entries()) {
                const prompt = generatePromptForBatch(batch);
    
                console.log(`Processing batch ${index + 1}/${batchedQuestions.length}:`);
                console.log("Prompt:", prompt);
    
                await fetchOllamaResponse(
                    apiUrl,
                    model,
                    prompt,
                    (newResponse) => setResponse((prevResponse) => prevResponse + newResponse),
                    setError,
                    () => setLoading(false)
                );
            }
        } catch (error) {
            console.error("Unexpected Error:", error);
            setError(`An unexpected error occurred: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    

    return (
        <div className="container">
            <h1>Test Ollama API</h1>
            <nav>
                <Link to="/" className="nav-link">
                    Go to Main Page
                </Link>
            </nav>
    
            <div className="criteria-section">
                <label htmlFor="model">Model:</label>
                <input
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Enter model name"
                />
            </div>
    
            <div className="upload-section">
                <button
                    className="submit-btn"
                    onClick={handleTestBatchedOllama}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Test Batched API"}
                </button>
            </div>
    
            <div className="result-section">
                <h3>Response:</h3>
                <div className="response-box">
                    <ReactMarkdown>{response || "No response yet."}</ReactMarkdown>
                </div>
    
                {error && (
                    <div className="error-section">
                        <strong>{error}</strong>
                        <button
                            className="upload-btn"
                            onClick={handleTestBatchedOllama}
                        >
                            Regenerate response?
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
    
};

export default OllamaTestPage;
