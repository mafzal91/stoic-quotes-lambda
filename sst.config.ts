/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "stoic-snapshots-lambda",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const api = new sst.aws.Function("MyFunction", {
      url: true,
      memory: "2 GB",
      timeout: "15 minutes",
      handler: "packages/index.handler",
      nodejs: {
        install: ["@sparticuz/chromium"],
      },
      environment: {
        IS_LOCAL: $app.stage === "production" ? "" : "1",
      },
    });

    return {
      url: api.url,
    };
  },
});
