import { branchService } from "../../restaurant_branches/services/branchService";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import orderTemplate from "./OrderReceipt.template";
import orderItemsTemplate from "./OrderItems.template";

export async function printOrderInvoice(order: Order) {

    const branchInfo = await branchService.getBranchInfo(order.branchId);
    const printable = await orderTemplate(order, branchInfo);

    const w = window.open("", "", "width=600,height=600");
    if (!w) return;
    w.document.write(`
        <html>
            <head>
                <title>Order #${order.orderId}</title>
            </head>
            <body>
                ${printable}
            </body>
        </html>
        `);
    w.document.close();
    w.focus();
    w.print();
    w.close();
}

export async function printOrderItems(orderItems: OrderItem[], order: Order) {
    const branchInfo = await branchService.getBranchInfo(order.branchId);
    const printable = await orderItemsTemplate(orderItems, order, branchInfo);
    
    const w = window.open("", "", "width=600,height=600");
    if (!w) return;
    w.document.write(`
        <html>
            <head>
                <title>Kitchen Order - ${order.orderId}</title>
            </head>
            <body>
                ${printable}
            </body>
        </html>
        `);
    w.document.close();
    w.focus();
    w.print();
    w.close();
}
    