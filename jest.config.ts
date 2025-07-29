export default {
  testEnvironment: "node",
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
  transform: { "^.+\\.[t|j]sx?$": "babel-jest" },
  roots: ["test/"],
};
