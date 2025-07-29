import { HttpServer, Context } from "./src";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    const port = parseInt(process.env.PORT || '1337');

    const context = new Context({});
    const server = await HttpServer(context);

    await server.listen({ port, host: "0.0.0.0" });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
