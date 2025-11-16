module.exports = {
  apps: [
    {
      name: "codemonster-frontend",
      cwd: "../frontend",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "codemonster-server",
      cwd: "../server",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
    {
      name: "codemonster-judge",
      cwd: "../judge",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
