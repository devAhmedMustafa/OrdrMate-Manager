import Order from '../models/Order';
import OrderItem from '../models/OrderItem';

const orderItemsTemplate = async (orderItems: OrderItem[], order: Order, branchInfo: any): Promise<string> => {
    // Format date and time
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB');
    const formattedTime = now.toLocaleTimeString('en-GB', { hour12: false });

    return `
        <style>
            @media print {
                html, body {
                    margin: 0;
                    padding: 0;
                    width: auto !important;
                    height: auto !important;
                }
                * {
                    page-break-before: avoid;
                    page-break-after: avoid;
                    page-break-inside: avoid;
                }
                [style*="display: flex"] {
                    display: block !important;
                }
                img {
                    max-width: 100% !important;
                    max-height: 100% !important;
                }
                div {
                    page-break-inside: avoid;
                }
            }
        </style>
        <div style="
            font-family: 'Courier New', monospace;
            max-width: 300px;
            margin: 0 auto;
            background: white;
            color: black;
            line-height: 1.4;
            font-size: 12px;
            padding: 20px;
        ">
            <!-- Header -->
            <div style="text-align: center; border-bottom: 2px solid black; padding-bottom: 15px; margin-bottom: 15px;">
                ${branchInfo.logoUrl ? `
                <div style="display: flex; justify-content: center; margin-bottom: 10px;">
                    <img src="${branchInfo.logoUrl}" alt="Restaurant Logo" style="width: 80px; height: 80px; object-fit: contain;"/>
                </div>
                ` : ''}
                <h1 style="margin: 0; color: black; font-size: 22px;">KITCHEN ORDER</h1>
                <h2 style="margin: 5px 0; color: black; font-size: 18px;">${branchInfo.restaurantName}</h2>
            </div>

            <!-- Order Info -->
            <div style="border: 1px solid black; padding: 12px; margin-bottom: 15px; text-align: center;">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">
                    ${formattedTime} - ${formattedDate}
                </div>
                ${order.orderType ? `
                <div style="font-size: 14px; font-weight: bold;">
                    ${order.orderType}${order.tableNumber ? ` - Table ${order.tableNumber}` : ''}
                </div>
                ` : ''}
            </div>

            <!-- Order Items -->
            <div style="margin-bottom: 15px;">
                <h3 style="color: black; border-bottom: 2px solid black; padding-bottom: 8px; margin-bottom: 12px; text-align: center;">ITEMS TO PREPARE</h3>
                ${orderItems.map(item => `
                <div style="border: 2px solid black; padding: 12px; margin-bottom: 10px; background: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong style="font-size: 16px; word-wrap: break-word; overflow-wrap: break-word; max-width: 200px;">${item.item.name}</strong>
                        <span style="font-size: 20px; font-weight: bold; color: black; border: 3px solid black; padding: 4px 12px; border-radius: 6px;">×${item.quantity}</span>
                    </div>
                    ${item.customizations ? `
                    <div style="border-top: 1px dashed black; padding-top: 6px; margin-top: 6px;">
                        <strong style="font-size: 12px; color: black;">Customizations:</strong>
                        ${Object.entries(item.customizations).map(([key, value]) => `
                        <div style="margin: 2px 0; font-size: 12px; color: black;">
                            <strong>${key}:</strong> ${value}
                        </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
                `).join('')}
            </div>

            <!-- Summary -->
            <div style="border-top: 2px solid black; padding-top: 12px; margin-bottom: 15px; text-align: center;">
                <div style="font-size: 18px; font-weight: bold; color: black;">
                    Total Items to Prepare: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                </div>
            </div>

            <!-- Kitchen Instructions -->
            <div style="border: 2px dashed black; padding: 10px; margin-bottom: 15px; text-align: center;">
                <h4 style="margin: 0 0 5px 0; color: black; font-size: 14px;">KITCHEN INSTRUCTIONS</h4>
                <p style="margin: 0; font-size: 11px; color: black;">Please prepare all items listed above</p>
                <p style="margin: 2px 0 0 0; font-size: 11px; color: black; font-weight: bold;">Order Type: ${order.orderType || 'Dine-in'}${order.tableNumber ? ` - Table ${order.tableNumber}` : ''}</p>
            </div>

            <!-- Footer -->
            <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid black;">
                <div style="text-align: center;">
                    <p style="margin: 5px 0; font-size: 14px; color: black; font-weight: bold;">Kitchen Copy</p>
                </div>
            </div>
        </div>
    `;
};

export default orderItemsTemplate;
