
const config = {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverage: true,
    roots: ["<rootDir>"],
    testMatch: ["**/__tests__/**/*.test.ts"],
    testPathIgnorePatterns: ["/node_modules/", "\\.integration\\.test\\.ts$"],
    coveragePathIgnorePatterns: ["mock-request.ts"],
    // setupFiles: ["<rootDir>/jest.setup.ts"],
    moduleFileExtensions: ["ts", "js", "json"],
    clearMocks: true,
    verbose: true,
};

export default config;
