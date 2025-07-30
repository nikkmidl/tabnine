import { Context } from "types";
import QueueService from "./Queue";

export default class QueueManager {
  private queues: Map<string, QueueService> = new Map();
  private ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
  }

  private getOrCreateQueue(queueName: string): QueueService {
    let queue = this.queues.get(queueName);
    if (!queue) {
      queue = new QueueService();
      this.queues.set(queueName, queue);
    }
    return queue;
  }

  async enqueue(queueName: string, message: Record<string, any>): Promise<void> {
    const queue = this.getOrCreateQueue(queueName);

    // First try to deliver any existing messages to waiting consumers
    while (queue.hasPendingConsumers() && queue.getLength() > 0) {
      const existingMessage = queue.dequeue();
      if (existingMessage) {
        await queue.deliverToConsumer(existingMessage);
      }
    }

    // Now handle the new message
    if (queue.hasPendingConsumers()) {
      const wasDelivered = await queue.deliverToConsumer(message);
      if (wasDelivered) {
        this.cleanupIfEmpty(queueName);
        return;
      }
    }

    // If no consumers or delivery failed, store in queue
    queue.enqueue(message);
    this.cleanupIfEmpty(queueName);
  }

  private cleanupIfEmpty(queueName: string): void {
    const queue = this.queues.get(queueName);
    if (queue?.isEmpty()) {
      this.queues.delete(queueName);
    }
  }

  async waitForMessage(
    queueName: string,
    timeoutMs: number = 10000
  ): Promise<Record<string, any> | undefined> {
    const queue = this.getOrCreateQueue(queueName);
    const message = await queue.waitForMessage(timeoutMs);
    this.cleanupIfEmpty(queueName);
    return message;
  }

  hasQueue(queueName: string): boolean {
    return this.queues.has(queueName);
  }

  getQueueCount(): number {
    return this.queues.size;
  }
}