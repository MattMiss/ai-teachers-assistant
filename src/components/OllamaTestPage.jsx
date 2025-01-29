import { useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import formattedTestData from "../data/formattedTestData";
import { ollamaApiLocal, fetchOllamaResponse } from "../utils/api";
import { batchQuestions, generatePromptForBatch } from "../utils/ai";
import { promptText } from "../utils/prompt"; // Assuming promptText contains intro and outro defaults

const OllamaTestPage = () => {
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [apiUrl] = useState(ollamaApiLocal);
    const [model, setModel] = useState("deepseek-r1:1.5b");

    const [criteriaType, setCriteria] = useState("default");
    const [customCriteria, setCustomCriteria] = useState("");


    const handleTestAPI = async () => {
        setLoading(true);
        setError("");
        setResponse("");

        const criteria = criteriaType === "default" ? promptText.criteria : customCriteria;

        const batchedQuestions = batchQuestions(formattedTestData.questions_and_answers, 5); // Batch size = 5 questions
        console.log("BatchedQuestions: ", batchedQuestions);

        try {
            for (const [index, batch] of batchedQuestions.entries()) {
                const prompt = generatePromptForBatch(batch, criteria);

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

            <div className="criteria-section">
                <label htmlFor="criteriaIntro">Criteria:</label>
                <select
                    id="criteriaIntro"
                    value={criteriaType}
                    onChange={(e) => setCriteria(e.target.value)}
                >
                    <option value="default">Default</option>
                    <option value="custom">Custom</option>
                </select>
                {criteriaType === "default" && (
                    <p className="default-text">Default Criteria: {promptText.criteria}</p>
                )}
                {criteriaType === "custom" && (
                    <input
                        type="text"
                        value={customCriteria}
                        onChange={(e) => setCustomCriteria(e.target.value)}
                        placeholder="Enter custom intro"
                    />
                )}
            </div>

            <div className="upload-section">
                <button
                    className="submit-btn"
                    onClick={handleTestAPI}
                    disabled={loading}
                >
                    {loading ? "Analyzing..." : "Analyze Student Answers"}
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
                            onClick={handleTestAPI}
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
