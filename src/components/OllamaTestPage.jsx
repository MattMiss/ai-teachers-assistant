import { useState } from "react";
import formattedTestData from "../data/formattedTestData";

const OllamaTestPage = () => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTestOllama = async () => {
    setLoading(true);
    setResponse("");

    const prompt = generatePrompt(formattedTestData);

    try {
      const res = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2",
          prompt,
        }),
      });

      if (res.ok) {
        const reader = res.body.getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
        
            const chunk = new TextDecoder("utf-8").decode(value);
            const result = JSON.parse(chunk);
            setResponse((prev) => prev + result.response || "");
        }
        
      } else {
        const errorText = await res.text();
        setResponse(`Error: ${res.status} - ${errorText}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generatePrompt = (data) => {
    let prompt = "Here are some questions about programming and answers from various people. Summarize each question based on the range of answers provided, and analyze what people generally think about each topic.\n\n";

    data.questions_and_answers.forEach((qa) => {
      prompt += `Q: ${qa.question}\n`;
      qa.answers.forEach((answer, idx) => {
        prompt += `A${idx + 1}: ${answer}\n`;
      });
      prompt += "\n";
    });

    prompt += "Now, summarize each question based on the range of answers and analyze what people generally think about these topics.";
    return prompt;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Ollama API</h1>
      <button onClick={handleTestOllama} disabled={loading}>
        {loading ? "Loading..." : "Test API"}
      </button>
      <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
        <h3>Response:</h3>
        <p>{response || "No response yet."}</p>
      </div>
    </div>
  );
};

export default OllamaTestPage;
