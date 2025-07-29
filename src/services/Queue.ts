import {
  Context,
} from "types";
import Consumer from "./Consumer";

// Node class for linked list implementation
class QueueNode {
  constructor(
    public data: Record<string, any>,
    public next: QueueNode | null = null
  ) {}
}

interface QueueBackend {
  push(message: Record<string, any>): void;
  pop(): Record<string, any> | undefined;
  peek(): Record<string, any> | undefined;
  size(): number;
  clear(): void;
}

class LinkedListQueueBackend implements QueueBackend {
  private head: QueueNode | null = null;
  private tail: QueueNode | null = null;
  private length: number = 0;

  push(message: Record<string, any>): void {
    const newNode = new QueueNode(message);
    this.length++;

    if (!this.tail) {
      this.head = this.tail = newNode;
      return;
    }

    this.tail.next = newNode;
    this.tail = newNode;
  }

  pop(): Record<string, any> | undefined {
    if (!this.head) {
      return undefined;
    }

    this.length--;
    const data = this.head.data;
    this.head = this.head.next;

    if (!this.head) {
      this.tail = null;
    }

    return data;
  }

  peek(): Record<string, any> | undefined {
    return this.head?.data;
  }

  size(): number {
    return this.length;
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
}

export default class QueueService {
  private backend: QueueBackend;
  consumer: Consumer;

  constructor(ctx: Context) {
    this.backend = new LinkedListQueueBackend();
    this.consumer = new Consumer(ctx);
  }

  async deliverToConsumer(message: Record<string, any>): Promise<boolean> {
    if (!message || typeof message !== 'object') {
      throw new Error('Invalid message format');
    }

    return this.consumer.resolveOldestConsumer(message);
  }

  enqueue(message: Record<string, any>): void {
    if (!message || typeof message !== 'object') {
      throw new Error('Invalid message format');
    }

    // Store directly in queue - consumer handling is done at QueueManager level
    this.backend.push(message);
  }

  dequeue(): Record<string, any> | undefined {
    return this.backend.pop();
  }

  peek(): Record<string, any> | undefined {
    return this.backend.peek();
  }

  getLength(): number {
    return this.backend.size();
  }

  clear(): void {
    this.backend.clear();
  }

  async waitForMessage(
    timeoutMs: number = 10000
  ): Promise<Record<string, any> | undefined> {
    // First check queue for existing messages
    const message = this.dequeue();
    if (message) return message;

    // If no message, register as waiting consumer
    return this.consumer.addWaitingConsumer(timeoutMs);
  }

  hasPendingConsumers(): boolean {
    return this.consumer.hasWaitingConsumers();
  }

  isEmpty(): boolean {
    return this.getLength() === 0 && !this.hasPendingConsumers();
  }
}
