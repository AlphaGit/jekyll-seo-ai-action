import { jest } from '@jest/globals';

jest.mock("openai", () => {
    return {
        OpenAIApi: jest.fn().mockImplementation(() => {
            return {
                createCompletion: jest.fn().mockImplementation(({ prompt }) => {
                    if (prompt.length > 4096) {
                        return Promise.reject(new Error("Prompt is too long"));
                    }
                    return Promise.resolve({
                        data: {
                            choices: [{
                                text: "Hello world",
                            }],
                        },
                    });
                }),
            };
        }),
    };
});

const { OpenAIApi } = await import("openai");

const getModelResponse = async (prompt) => {
    const api = new OpenAIApi();
    if (prompt.length > 4096) {
        throw new Error("Prompt is too long");
    }
    const response = await api.createCompletion({ prompt });
    return response;
};

describe("getModelResponse", () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'debug').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    it("should throw an error when the prompt is too long", async () => {
        const prompt = "a b ".repeat(5000);
        await expect(getModelResponse(prompt)).rejects.toThrow("Prompt is too long");
    });
});

