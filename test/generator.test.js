import { jest } from '@jest/globals'

jest.unstable_mockModule("fs/promises", () => ({
    readFile: jest.fn(),
    writeFile: jest.fn(),
}));
jest.unstable_mockModule("../src/openai-client", () => ({
    getModelResponse: jest.fn().mockResolvedValue(""),
}));

const { generateDescriptions } = await import("../src/generator");
const { getModelResponse } = await import("../src/openai-client");
const fs = await import("fs/promises");

describe("generateDescriptions", () => {
    // beforeEach(() => {
    //     jest.resetAllMocks();
    // });

    it("should return an empty array when given an empty array", async () => {
        const result = await generateDescriptions([]);
        expect(result).toEqual([]);
    });

    it("should return an empty array when given an array of non-existent files", async () => {
        fs.readFile.mockRejectedValue(new Error("File not found"));
        const result = await generateDescriptions(["non-existent-file.md"]);
        expect(result).toEqual([]);
    });

    it("should return an empty array when given an array of files that don't contain front matter", async () => {
        const result = await generateDescriptions(["test/fixtures/empty.md"]);
        expect(result).toEqual([]);
    });

    it("should return an empty array when given an array of files that already contain a description", async () => {
        const result = await generateDescriptions(["test/fixtures/with-description.md"]);
        expect(result).toEqual([]);
    });

    it("should return an empty array when the files do not have front matters", async () => {
        fs.readFile.mockResolvedValueOnce(`\n\nBody`);
        const result = await generateDescriptions(["test/fixtures/without-front-matter.md"]);
        expect(result).toEqual([]);
    });

    it("should return an empty array when the files do not have a date in the front matter", async () => {
        fs.readFile.mockResolvedValueOnce(`---\n---\n\nBody`);
        const result = await generateDescriptions(["test/fixtures/without-date.md"]);
        expect(result).toEqual([]);
    });

    it("should return an empty array when the files already have descriptions in the front matter", async () => {
        fs.readFile.mockResolvedValueOnce(`---\ndate: 2021-01-01\ndescription: This is a test description.\n---\n\nBody`);
        const result = await generateDescriptions(["test/fixtures/with-description.md"]);
        expect(result).toEqual([]);
    });

    it("should return an array of results when given an array of files that don't contain a description", async () => {
        fs.readFile.mockResolvedValueOnce(`---\ndate: 2021-01-01\n---\n\nBody`);
        getModelResponse.mockResolvedValueOnce("This is a generated test description.");
        const result = await generateDescriptions(["test/fixtures/without-description.md"]);
        expect(result).toEqual([
            {
                page: "test/fixtures/without-description.md",
                description: "This is a generated test description.",
            },
        ]);
        expect(fs.writeFile).toHaveBeenCalledWith(
            "test/fixtures/without-description.md",
            `---\ndate: 2021-01-01T00:00:00.000Z\ndescription: This is a generated test description.\n---\n\n\nBody`,
            "utf-8"
        );
    });

    it("should ignore separators in the body", async () => {
        fs.readFile.mockResolvedValueOnce(`---\ndate: 2021-01-01\n---\n\nBody\n---\n\nBody2`);
        getModelResponse.mockResolvedValueOnce("This is a generated test description.");
        await generateDescriptions(["test.md"]);
        expect(fs.writeFile).toHaveBeenCalledWith(
            "test.md",
            `---\ndate: 2021-01-01T00:00:00.000Z\ndescription: This is a generated test description.\n---\n\n\nBody\n---\n\nBody2`,
            "utf-8"
        );
    });
});
