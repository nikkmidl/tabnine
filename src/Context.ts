import QueueController from "./controllers/QueueController";
import { QueueManager } from "./services";

export default class Context {
  server: any;
  queueManager: QueueManager;
  queueController: QueueController;

  constructor({ server, db }: any) {
    this.server = server;

    this.queueManager = new QueueManager(this);
    this.queueController = new QueueController(this);
  }

  get serviceHandlers() {
    return {
      getMessage: this.queueController.getMessage,
      postMessage: this.queueController.postMessage,
    };
  }
}
