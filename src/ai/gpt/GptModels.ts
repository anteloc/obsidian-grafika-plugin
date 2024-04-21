// TODO Add other supported models
// Models set in order of preference due to its accuracy, performance, etc.
export const OPENAI_MODELS = [
    {
        name: "GPT-4 Turbo",
        model: "gpt-4-turbo",
    },
];

export const DEFAULT_SYSTEM_PROMPT = `You are an expert in data science, data plotting and also data and plot interpretation and analysis. 
You are asked to analyze the following plot image and provide a detailed answer to the question(s) or task(s) 
described in the message together with the image.`;

export const DEFAULT_ANALYZE_IMAGE_PROMPT = `Analyze the attached graph plot image and provide the following informative sections:
1. Plot Description: describe the plot meaning in a maximum of 20 words
2. Insights: In a maximum of 100 words, provide insights about the meaning of the plot about:
- the conclusions that can be drawn from the data, 
- the relevance of the plot to the data analysis context
- the implications of the plot to the data analysis context
4. Foresight: In a maximum of 50 words, provide foresight about the future implications of the plot to the data analysis context
- If the X axis is time, what future trends can be expected?
- If the X axis is a category, what future changes can be expected for other categories?
- If the X axis is a continuous variable, what values of the variable, not present in the plot, could be relevant to take into account?
- If none of the above, analyze what future implications can be expected taking into account the whole plot and not only an X axis
3. Conclusion: Provide a conclusion based on the insights and foresight sections, in a maximum of 100 words`;

export const DEFAULT_GPT_MODEL = OPENAI_MODELS[0];
export const DEFAULT_MAX_WORDS = 500;


