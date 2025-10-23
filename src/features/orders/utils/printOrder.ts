import { branchService } from "../../restaurant_branches/services/branchService";
import OrderResponse from "../dtos/OrderResponse";
import OrderItemResponse from "../dtos/OrderItemResponse";
import orderTemplate from "./OrderReceipt.template";
import orderItemsTemplate from "./OrderItems.template";

export async function printOrderInvoice(order: OrderResponse) {

    const branchInfo = await branchService.getBranchInfo(order.branchId);
    const printable = await orderTemplate(order, branchInfo);

    const w = window.open("", "", "width=600,height=600");
    if (!w) return;
    w.document.write(`
        <html>
            <head>
                <title>Gahez</title>
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

export async function printOrderItems(orderItems: OrderItemResponse[], order: OrderResponse) {
    const branchInfo = await branchService.getBranchInfo(order.branchId);
    const printable = await orderItemsTemplate(orderItems, order, branchInfo);
    
    const w = window.open("", "", "width=600,height=600");
    if (!w) return;
    w.document.write(`
        <html>
            <head>
                <title>Gahez</title>
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
    