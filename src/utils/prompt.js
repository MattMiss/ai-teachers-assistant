export const promptText = {
    criteria: "Below is a list of questions and responses from various people. For each question:\n1. Summarize the range of answers in 1-2 sentences.\n2. Highlight key themes or patterns from the answers.\n3. Provide a concise analysis of what people generally think about the topic.\n\n",
};

export const promptTextFormatted = {
    testCriteria: `Belows is a list of questions and responses from various people. For each question: 1. Summarize the range of answers in 1-2 sentences. 2. Highlight key themes or patterns from the answers. 3. Provide a concise analysis of what people generally think about the topic. After analyzing each question, format your response as a JSON object following this structure:
        {
        "questions": [
            {
            "question": "Question text here",
            "summary": "Summary of range of answers",
            "themes": ["Theme 1", "Theme 2", "Theme 3"],
            "analysis": "General analysis of responses"
            }
        ]
        }`,
    end: "Please analyze the responses and return your analysis in the JSON format specified above.",
};
