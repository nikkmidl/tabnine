import type { FastifyInstance } from "fastify";
import { Consumer, QueueManager } from "src/services";

export interface Context {
  server: FastifyInstance;
  queueManager: QueueManager;
  get serviceHandlers(): Record<string, (...args: any) => Promise<unknown>>;
}
