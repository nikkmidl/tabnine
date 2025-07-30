interface MessageResolver {
  id: string;
  timestamp: number;
  resolve: (message: Record<string, any> | undefined) => void;
  timeoutId: NodeJS.Timeout;
}

class ConsumerNode {
  constructor(
    public resolver: MessageResolver,
    public next: ConsumerNode | null = null
  ) {}
}

export default class Consumer {
  private head: ConsumerNode | null = null;
  private tail: ConsumerNode | null = null;
  private nextId = 0;

  constructor() {
  }

  private generateId(): string {
    return (this.nextId++).toString();
  }

  addWaitingConsumer(
    timeoutMs: number = 10000
  ): Promise<Record<string, any> | undefined> {
    return new Promise((resolve) => {
      const id = this.generateId();
      const timestamp = Date.now();

      const timeoutId = setTimeout(() => {
        this.removeConsumer(id);
        resolve(undefined);
      }, timeoutMs);

      const resolver: MessageResolver = {
        id,
        timestamp,
        resolve,
        timeoutId,
      };

      // Add to linked list (FIFO order)
      const newNode = new ConsumerNode(resolver);
      if (!this.head) {
        this.head = this.tail = newNode;
      } else {
        this.tail!.next = newNode;
        this.tail = newNode;
      }
    });
  }

  resolveOldestConsumer(message: Record<string, any>): boolean {
    if (!this.head) return false;

    const consumer = this.head;
    this.head = this.head.next;

    if (!this.head) {
      this.tail = null;
    }

    clearTimeout(consumer.resolver.timeoutId);
    consumer.resolver.resolve(message);
    return true;
  }

  private removeConsumer(id: string): void {
    if (!this.head) return;

    // Handle head removal
    if (this.head.resolver.id === id) {
      this.head = this.head.next;
      if (!this.head) this.tail = null;
      return;
    }

    // Handle other removals
    let current = this.head;
    while (current.next) {
      if (current.next.resolver.id === id) {
        current.next = current.next.next;
        if (!current.next) this.tail = current;
        return;
      }
      current = current.next;
    }
  }

  hasWaitingConsumers(): boolean {
    return this.head !== null;
  }
}
