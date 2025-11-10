
const config = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>"],
    testMatch: ["**/__tests__/**/*.test.ts"],
    // setupFiles: ["<rootDir>/jest.setup.ts"],
    moduleFileExtensions: ["ts", "js", "json"],
    clearMocks: true,
    verbose: true,
};

export default config;
