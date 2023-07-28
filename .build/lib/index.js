import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// stacks/MyStack.js
import { Api } from "@serverless-stack/resources";
import * as lambda from "aws-cdk-lib/aws-lambda";
var layerArn = "arn:aws:lambda:us-east-1:824714483059:layer:chromium_v109:1";
function MyStack({ stack }) {
  const api = new Api(stack, "api", {
    routes: {
      "GET /": {
        function: {
          handler: "functions/lambda.handler",
          timeout: 15,
          layers: [
            lambda.LayerVersion.fromLayerVersionArn(
              stack,
              "ChromeLayer",
              layerArn
            )
          ],
          bundle: { externalModules: ["@sparticuz/chromium"] }
        }
      }
    }
  });
  stack.addOutputs({
    ApiEndpoint: api.url
  });
}
__name(MyStack, "MyStack");

// stacks/index.js
import { App } from "@serverless-stack/resources";
function stacks_default(app) {
  app.setDefaultFunctionProps({
    runtime: "nodejs16.x",
    srcPath: "services",
    bundle: {
      format: "cjs"
    }
  });
  app.stack(MyStack);
}
__name(stacks_default, "default");
export {
  stacks_default as default
};
//# sourceMappingURL=index.js.map
