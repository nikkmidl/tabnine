import { Context, FastifyRequest, FastifyReply } from "types";

type GetMessageParams = { Querystring: { timeout: string }, Params: { queue_name: string } };
type PostMessageBody = {
    Body: Record<string, any>
    Params: { queue_name: string }
};

const DEFAULT_TIMEOUT = 10000; // 10 seconds

export default class QueueController {
  ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
    this.getMessage = this.getMessage.bind(this);
    this.postMessage = this.postMessage.bind(this);
  }

  async postMessage(req: FastifyRequest<PostMessageBody>, res: FastifyReply) {
    try {
      const message = req.body;
      const queue_name = req.params.queue_name;

      if (!queue_name || typeof queue_name !== "string") {
        return res.status(400).send("Queue name is required");
      }

      this.ctx.queueManager.enqueue(queue_name, message);
      res.status(200).send();
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }

  async getMessage(req: FastifyRequest<GetMessageParams>, res: FastifyReply) {
    const { queue_name } = req.params;
    const timeoutMs = parseInt(req.query.timeout) || DEFAULT_TIMEOUT;

    if (!queue_name) {
      return res.status(400).send("Queue name is required");
    }

    const message = await this.ctx.queueManager.waitForMessage(queue_name, timeoutMs);

    if (!message) {
      return res.status(204).send();
    }

    res.status(200).send(JSON.stringify(message));
  }
}
