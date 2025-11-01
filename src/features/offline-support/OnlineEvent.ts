export default class OnlineEvent {

    private static instance: OnlineEvent = new OnlineEvent();
    
    public isOnline = navigator.onLine;

    private subscribers: CallableFunction[] = [];

    subscribe(callback: CallableFunction) {
        this.subscribers.push(callback);
    }

    private notifySubscribers() {
        this.subscribers.forEach((callback) => callback(this.isOnline));
    }

    private updateOnlineStatus(online: boolean) {
        if (this.isOnline === online) return;
        this.isOnline = online;
        this.notifySubscribers();
    }

    private constructor() {
        window.addEventListener('online', () => this.updateOnlineStatus(true));
        window.addEventListener('offline', () => this.updateOnlineStatus(false));
    }

    static getInstance() {
        return this.instance;
    }

}