import path from "path";
import Fastify, { FastifyInstance } from "fastify";
import { Context } from "types";

let serverInstance: FastifyInstance;

export default async function (context: Context) {
  if (serverInstance) return serverInstance;

  const isDist = __dirname.includes("dist");
  const rootPath = path.join(__dirname, isDist ? "../.." : "..");

  const openapiGlue = await import(
    path.join(
      rootPath,
      "node_modules/fastify-openapi-glue",
      "index.js"
    )
  );

  const glueOptions = {
    specification: path.join(rootPath, "openapi.yaml"),
    serviceHandlers: context.serviceHandlers,
  };

  serverInstance = Fastify({ logger: true });

  await serverInstance.register(openapiGlue, glueOptions);
  await serverInstance.register((instance) => {
    instance.get('/ping', (req, res) => { res.send('ok') })
  });

  return serverInstance;
}
