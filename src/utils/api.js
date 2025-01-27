export const ollamaApiLocal = "http://localhost:11434/api/generate";

// export const fetchOllamaResponse = async (apiUrl, model, prompt, onUpdate, onError, onComplete) => {
//     try {
//         const res = await fetch(apiUrl, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 model,
//                 prompt,
//             }),
//         });

//         if (res.ok) {
//             const reader = res.body.getReader();
//             const decoder = new TextDecoder("utf-8");

//             while (true) {
//                 const { done, value } = await reader.read();
//                 if (done) break;

//                 const chunk = decoder.decode(value);
//                 const result = JSON.parse(chunk);

//                 // Call the update function to provide partial responses to the component
//                 onUpdate((prev) => prev + (result.response || ""));
//             }

//             // Notify completion once the response stream ends
//             onComplete();
//         } else {
//             const errorText = await res.text();
//             onError(`Error: ${res.status} - ${errorText}`);
//         }
//     } catch (error) {
//         onError(`Error: ${error.message}`);
//     }
// };

export const fetchOllamaResponse = async (apiUrl, model, prompt, onUpdate, onError, onComplete) => {
    try {
        const res = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                prompt,
            }),
        });

        if (res.ok) {
            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);

                let result;
                try {
                    result = JSON.parse(chunk);
                } catch (e) {
                    console.error("Failed to parse chunk:", chunk, e);
                    onError("Failed to parse chunk: " + chunk);
                    break;
                }

                onUpdate(result.response || "");
            }

            onComplete();
        } else {
            const errorText = await res.text();
            try {
                const errorJson = JSON.parse(errorText);
                onError(`Error: ${res.status} - ${errorJson.message || errorText}`);
            } catch {
                onError(`Error: ${res.status} - ${errorText}`);
            }
        }
    } catch (error) {
        onError(`Error: ${error.message}`);
    } finally {
        if (onComplete && typeof onComplete === "function") {
            onComplete();
        }
    }
};

