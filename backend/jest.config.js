module.exports = {
    testEnvironment: "node",
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.js",
        "!src/config/**",
        "!src/types/**",
        "!src/security/**",
        "!src/server.js",
        "!src/app.js",
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov", "html"],
};