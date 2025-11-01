import OnlineEvent from "../features/offline-support/OnlineEvent";

export default class QueueInvoker {

    private queue: Array<() => Promise<void>> = [];
    private isProcessing: boolean = false;

    enqueue(task: () => Promise<void>): void {
        this.queue.push(task);
        this.processQueue();
    }
    
    private async processQueue(): Promise<void> {
        if (this.isProcessing) {
            return;
        }

        this.isProcessing = true;
        
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (task) {
                try {
                    await task();
                } catch (error) {
                    console.error('Error executing task in QueueInvoker:', error);
                }
            }
        }

        this.isProcessing = false;
    }

    private constructor() { 
        OnlineEvent.getInstance().subscribe((isOnline: boolean) => {
            if (isOnline) {
                this.processQueue();
            }
        });
    }

    private static instance: QueueInvoker;
    
    public static getInstance(): QueueInvoker {
        if (!QueueInvoker.instance) {
            QueueInvoker.instance = new QueueInvoker();
        }
        return QueueInvoker.instance;
    }

}