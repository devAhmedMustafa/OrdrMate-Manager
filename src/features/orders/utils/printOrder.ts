import Order from "../models/Order";
import OrderItem from "../models/OrderItem";



function exportOrderInvoice(order: Order) : string{
    return `
    <h1> Order #${order.orderId}
    <h3> Customer: ${order.customer} </h3>
    <h3> Date: ${order.orderDate} </h3>

    <ul>
        ${order.orderItems.map(item => `<li>${item.item.name} - ${item.quantity} x L.E.${item.item.price}</li>`).join('')}
    </ul>

    <h2> Total Amount: L.E${order.totalAmount} </h2>
    `
}

function exportOrderItems(orderItems: OrderItem[]) : string {
    return `
    <ul>
        ${orderItems.map(item => {
            var itemHtml = `<li>${item.item.name} - ${item.quantity} x L.E.${item.item.price}`;
            if (item.customizations) {
                itemHtml += `<ul>`;
                for (const [key, value] of Object.entries(item.customizations)) {
                    itemHtml += `<li>${key}: ${value}</li>`;
                }
                itemHtml += `</ul>`;
            }
            itemHtml += `</li>`;
            return itemHtml;
        }).join('')
        }
    </ul>
    `
}

export function printOrderInvoice(order: Order) {
    const printable = exportOrderInvoice(order);
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

export function printOrderItems(orderItems: OrderItem[]) {
    const printable = exportOrderItems(orderItems);
    const w = window.open("", "", "width=600,height=600");
    if (!w) return;
    w.document.write(`
        <html>
            <head>
                <title>Order Items</title>
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
    