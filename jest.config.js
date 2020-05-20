module.exports = {
	collectCoverage: true,
	collectCoverageFrom: ['./src/index.js'],
	coverageDirectory: './coverage',
	coverageThreshold: {
		global: {
			branches: 90,
			functions: 90,
			lines: 90,
			statements: 90,
		},
	},
	testMatch: ['**/test/**/*.[jt]s?(x)'],
};
