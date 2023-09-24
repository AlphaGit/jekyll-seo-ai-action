import { jest } from '@jest/globals'

jest.unstable_mockModule("openai", () => ({

    Configuration: jest.fn(),
    OpenAIApi: jest.fn(() => ({
        createCompletion: jest.fn().mockResolvedValue({
            data: {
                choices: [{
                    text: "Hello world",
                }],
            },
        }),
    })),
}));

// Commented out the duplicate jest.unstable_mockModule("openai") block

const { getModelResponse } = await import("../src/openai-client");

describe("getModelResponse", () => {
    it("should throw an error when the prompt is too long", async () => {
        const prompt = "a b ".repeat(5000);
        await expect(getModelResponse(prompt)).rejects.toThrow("Prompt is too long");
    });
});

