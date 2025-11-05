import { v4 as uuidv4 } from 'uuid';

export default class Payment {
    id: string;
    orderId: string;
    amount: number;
    paymentMethod: string;
    provider: string;
    transactionId: string;
    paidAt: Date;
    externalRef: string | null;

    constructor(params: {
        id?: string;
        orderId: string;
        amount: number;
        paymentMethod: string;
        provider: string;
        transactionId: string;
        paidAt: Date;
        externalRef: string | null;
    }) {
        this.id = params.id || uuidv4();
        this.orderId = params.orderId;
        this.amount = params.amount;
        this.paymentMethod = params.paymentMethod;
        this.provider = params.provider;
        this.transactionId = params.transactionId;
        this.paidAt = params.paidAt;
        this.externalRef = params.externalRef;
    }
}