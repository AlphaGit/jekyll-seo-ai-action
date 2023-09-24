import { jest } from '@jest/globals';

jest.unstable_mockModule("openai", () => ({
    createCompletion: jest.fn().mockResolvedValue({
        data: {
            choices: [{
                text: "Hello world",
            }],
        },
    }),
}));

const { getModelResponse } = await import("../src/openai-client");

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

