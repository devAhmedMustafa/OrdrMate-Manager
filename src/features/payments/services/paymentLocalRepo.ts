import { db } from "../../offline-support/LocalDB";
import Payment from "../models/Payment";

class PaymentLocalRepo {

    async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
        try {
            const payment = await db.payments.where('orderId').equals(orderId).first();
            return payment || null;
        }
        catch (error) {
            throw error;
        }
    }

    async updatePayment(payment: Payment): Promise<void> {
        try {
            await db.payments.put(payment);
        }
        catch (error) {
            throw error;
        }
    }

}

export default new PaymentLocalRepo();