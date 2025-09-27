import Order from '../models/Order';
import OrderItem from '../models/OrderItem';

const orderItemsTemplate = async (orderItems: OrderItem[], order: Order, branchInfo: any): Promise<string> => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB');
    const formattedTime = now.toLocaleTimeString('en-GB', { hour12: false });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <title>Kitchen Order</title>
        <style>
            body {
                font-family: monospace, sans-serif;
                max-width: 280px;
                margin: 0 auto;
                background: #fff;
                color: #000;
                font-size: 12px;
                line-height: 1.4;
            }
            h1, h2, h3, h4, p { margin: 0; padding: 0; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .box { border: 1px solid black; padding: 8px; margin: 8px 0; }
            .item { border: 1px solid black; padding: 6px; margin: 6px 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 2px 0; vertical-align: top; }
        </style>
    </head>
    <body onload="window.print()">

        <!-- Header -->
        <div class="center box" style="border: none; border-bottom: 2px solid black;">
            ${branchInfo.logoUrl ? `
            <div style="margin-bottom: 6px;">
                <img src="${branchInfo.logoUrl}" alt="Logo" style="max-width: 60px; max-height: 60px;"/>
            </div>
            ` : ''}
            <h1 style="font-size: 18px;">KITCHEN ORDER</h1>
            <h2 style="font-size: 14px;">${branchInfo.restaurantName}</h2>
        </div>

        <!-- Order Info -->
        <div class="box center">
            <div class="bold">${formattedTime} - ${formattedDate}</div>
            ${order.orderType ? `
            <div class="bold" style="margin-top: 4px;">
                ${order.orderType}${order.tableNumber ? ` - Table ${order.tableNumber}` : ''}
            </div>
            ` : ''}
        </div>

        <!-- Items -->
        <h3 class="center" style="margin: 10px 0; border-bottom: 2px solid black; padding-bottom: 4px;">ITEMS TO PREPARE</h3>
        ${orderItems.map(item => `
        <div class="item">
            <table>
                <tr>
                    <td class="bold" style="font-size: 14px; max-width: 150px; word-wrap: break-word;">${item.item.name}</td>
                    <td class="center bold" style="font-size: 16px; border: 1px solid black; padding: 2px 6px;">×${item.quantity}</td>
                </tr>
            </table>
            ${item.customizations ? `
            <div style="margin-top: 4px; border-top: 1px dashed black; padding-top: 4px;">
                <div class="bold" style="font-size: 11px;">Customizations:</div>
                ${Object.entries(item.customizations).map(([key, value]) => `
                <div style="font-size: 11px;"><strong>${key}:</strong> ${value}</div>
                `).join('')}
            </div>
            ` : ''}
        </div>
        `).join('')}

        <!-- Summary -->
        <div class="center box bold" style="margin-top: 10px; border-top: 2px solid black;">
            Total Items: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}
        </div>

        <!-- Instructions -->
        <div class="box center" style="border: 1px dashed black;">
            <h4 style="font-size: 12px; margin-bottom: 2px;">KITCHEN INSTRUCTIONS</h4>
            <p style="font-size: 11px;">Prepare all items listed above</p>
            <p style="font-size: 11px; font-weight: bold;">
                Order Type: ${order.orderType || 'Dine-in'}${order.tableNumber ? ` - Table ${order.tableNumber}` : ''}
            </p>
        </div>

        <!-- Footer -->
        <div class="center" style="margin-top: 12px; border-top: 1px solid black; padding-top: 6px;">
            <p class="bold" style="font-size: 12px;">Kitchen Copy</p>
        </div>

    </body>
    </html>
    `;
};

export default orderItemsTemplate;
