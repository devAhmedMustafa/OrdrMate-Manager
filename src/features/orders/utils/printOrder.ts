import Order from "../models/Order";



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