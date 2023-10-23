import { jest } from '@jest/globals'

// Mock console methods to prevent output during tests
global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
};

jest.unstable_mockModule("fs/promises", () => ({
    readFile: jest.fn(),
    writeFile: jest.fn(),
}));
jest.unstable_mockModule("../src/openai-client", () => ({
    getModelResponse: jest.fn().mockResolvedValue(""),
}));

const { generateDescriptions, DescriptionResult, GenerationStatus } = await import("../src/generator");
const { getModelResponse } = await import("../src/openai-client");
const fs = await import("fs/promises");

describe("generateDescriptions", () => {
    it("should return an empty array when given an empty array", async () => {
        const result = await generateDescriptions([]);
        expect(result).toEqual([]); // No changes needed as the input is an empty array
    });

    it("should return an empty array when given an array of non-existent files", async () => {
        fs.readFile.mockRejectedValue(new Error("File not found"));
        const result = await generateDescriptions(["non-existent-file.md"]);
        expect(result).toEqual([new DescriptionResult("non-existent-file.md", null, GenerationStatus.UNKNOWN_ERROR, "Error generating description for non-existent-file.md: File not found")]);
        expect(result).toEqual([new DescriptionResult("test/fixtures/empty.md", null, GenerationStatus.UNKNOWN_ERROR, "No front matter found for test/fixtures/empty.md -- is it really a blog post?")]);
        expect(result).toEqual([new DescriptionResult("test/fixtures/with-description.md", "Existing description", GenerationStatus.SKIPPED, "Front matter already contains a description for test/fixtures/with-description.md -- skipping")]);
        expect(result).toEqual([new DescriptionResult("test/fixtures/without-front-matter.md", null, GenerationStatus.UNKNOWN_ERROR, "No front matter found for test/fixtures/without-front-matter.md -- is it really a blog post?")]);
        expect(result).toEqual([new DescriptionResult("test/fixtures/without-date.md", null, GenerationStatus.UNKNOWN_ERROR, "No date in front matter for test/fixtures/without-date.md")]);
        expect(result).toEqual([new DescriptionResult("test/fixtures/with-description.md", "This is a test description.", GenerationStatus.SKIPPED, "Front matter already contains a description for test/fixtures/with-description.md -- skipping")]);
    });

    it("should return an empty array when the files do not have front matters", async () => {
        fs.readFile.mockResolvedValueOnce(`\n\nBody`);
        const result = await generateDescriptions(["test/fixtures/without-front-matter.md"]);
        expect(result).toEqual([new DescriptionResult("test/fixtures/without-front-matter.md", null, GenerationStatus.UNKNOWN_ERROR, "Error: No front matter found")]);
    });

    it("should return an empty array when the files do not have a date in the front matter", async () => {
        fs.readFile.mockResolvedValueOnce(`---\n---\n\nBody`);
        const result = await generateDescriptions(["test/fixtures/without-date.md"]);
        expect(result).toEqual([new DescriptionResult("test/fixtures/without-date.md", null, GenerationStatus.UNKNOWN_ERROR, "Error: No date in front matter")]);
    });

    it("should return an empty array when the files already have descriptions in the front matter", async () => {
        fs.readFile.mockResolvedValueOnce(`---\ndate: 2021-01-01\ndescription: This is a test description.\n---\n\nBody`);
        const result = await generateDescriptions(["test/fixtures/with-description.md"]);
        expect(result).toEqual([new DescriptionResult("test/fixtures/with-description.md", "This is a test description.", GenerationStatus.SKIPPED, "Description already present")]);
    });

    it("should return an array of results when given an array of files that don't contain a description", async () => {
        fs.readFile.mockResolvedValueOnce(`---\ndate: 2021-01-01\n---\n\nBody`);
        getModelResponse.mockResolvedValueOnce("This is a generated test description.");
        const result = await generateDescriptions(["test/fixtures/without-description.md"]);
        expect(result).toEqual([
            new DescriptionResult("test/fixtures/without-description.md", "This is a generated test description.", GenerationStatus.GENERATED, ""),
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
