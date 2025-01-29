import { promptText } from "./prompt";

export const generatePrompt = (data) => {
    let prompt = `${promptText.intro}\n\n`;

    data.questions_and_answers.forEach((qa) => {
        prompt += `Q: ${qa.question}\n`;
        qa.answers.forEach((answer, idx) => {
            prompt += `A${idx + 1} (User: ${answer.userId}): ${answer.response}\n`;
        });
        prompt += "\n";
    });
    
    prompt += `${promptText.outro}`;
    return prompt;
};

export const batchQuestions = (data, batchSize) => {
    const batchedData = [];
    for (let i = 0; i < data.length; i += batchSize) {
        batchedData.push(data.slice(i, i + batchSize));
    }
    return batchedData;
};

export const generatePromptForBatch = (batch, criteria) => {
    let prompt = `${criteria}\n`;

    batch.forEach((qa) => {
        prompt += `Q: ${qa.question}\n`;
        qa.answers.forEach((answer, idx) => {
            prompt += `A${idx + 1} (User: ${answer.userId}): ${answer.response}\n`;
        });
        prompt += "\n";
    });

    return prompt;
};

export const generateFormattedPromptForBatch = (batch, criteria) => {
    let prompt = `${criteria}\n`;

    batch.forEach((qa) => {
        prompt += `Q: ${qa.question}\n`;
        qa.answers.forEach((answer, idx) => {
            prompt += `A${idx + 1} (User: ${answer.userId}): ${answer.response}\n`;
        });
        prompt += "\n";
    });
    
    prompt += `${promptText.end}`;
    return prompt;
};


