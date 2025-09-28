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
            @media print {
                @page {
                    size: A4;
                    margin: 8mm;
                }
                html, body {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: auto !important;
                    height: auto !important;
                    font-family: Arial, sans-serif !important;
                    font-size: 12px !important;
                    line-height: 1.3 !important;
                    color: #000 !important;
                    background: white !important;
                }
                * {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    page-break-before: avoid !important;
                    page-break-after: avoid !important;
                    page-break-inside: avoid !important;
                }
                .no-break {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                .force-break {
                    page-break-after: always !important;
                }
            }
            
            html, body {
                margin: 0;
                padding: 12px;
                width: auto;
                height: auto;
                font-family: Arial, sans-serif;
                font-size: 12px;
                line-height: 1.3;
                color: #000;
                background: white;
            }
        </style>
    </head>
    <body onload="window.print()">

        <!-- Header Section -->
        <div style="text-align: center; border-bottom: 3px solid #000; padding-bottom: 8px; margin-bottom: 12px;" class="no-break">
            ${branchInfo.logoUrl ? `
            <div style="margin-bottom: 8px;">
                <img src="${branchInfo.logoUrl}" alt="Logo" style="max-width: 80px; max-height: 80px; display: block; margin: 0 auto;"/>
            </div>
            ` : ''}
            <h1 style="font-size: 20px; font-weight: bold; margin: 0 0 4px 0; letter-spacing: 2px;">KITCHEN ORDER</h1>
            <h2 style="font-size: 16px; font-weight: normal; margin: 0; color: #333;">${branchInfo.restaurantName}</h2>
        </div>

        <!-- Order Information -->
        <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f8f8f8; padding: 8px 12px; border: 2px solid #000; margin-bottom: 16px; font-weight: bold;" class="no-break">
            <div style="font-size: 14px;">
                <div style="margin-bottom: 2px;">📅 ${formattedDate}</div>
                <div>🕒 ${formattedTime}</div>
            </div>
            ${order.orderType ? `
            <div style="text-align: right; font-size: 14px;">
                <div style="background-color: #000; color: white; padding: 4px 8px; border-radius: 4px; display: inline-block;">
                    ${order.orderType}${order.tableNumber ? ` - Table ${order.tableNumber}` : ''}
                </div>
            </div>
            ` : ''}
        </div>

        <!-- Items Header -->
        <div style="text-align: center; background-color: #000; color: white; padding: 8px; margin-bottom: 12px; font-weight: bold; font-size: 16px; letter-spacing: 1px;" class="no-break">
            🍽️ ITEMS TO PREPARE
        </div>

        <!-- Items List -->
        <div style="margin-bottom: 16px;">
            ${orderItems.map((item, index) => `
            <div style="border: 2px solid #ddd; margin-bottom: 10px; border-radius: 6px; overflow: hidden; background-color: #fff;" class="no-break">
                <!-- Item Header -->
                <div style="background-color: #f0f0f0; padding: 8px 12px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: bold; font-size: 14px; color: #000; max-width: 70%; word-wrap: break-word;">
                        ${index + 1}. ${item.item.name}
                    </div>
                    <div style="background-color: #000; color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 16px; min-width: 50px; text-align: center;">
                        ×${item.quantity}
                    </div>
                </div>
                
                <!-- Customizations -->
                ${item.customizations && Object.keys(item.customizations).length > 0 ? `
                <div style="padding: 10px 12px; background-color: #fffbf0; border-top: 1px dashed #ccc;">
                    <div style="font-weight: bold; font-size: 12px; color: #666; margin-bottom: 6px; text-transform: uppercase;">
                        ⚙️ Customizations:
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 4px;">
                        ${Object.entries(item.customizations).map(([key, value]) => `
                        <div style="background-color: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 4px 8px; font-size: 11px;">
                            <span style="font-weight: bold; color: #333;">${key}:</span> 
                            <span style="color: #000;">${value}</span>
                        </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- Item Notes Section (if needed in future) -->
                <div style="padding: 6px 12px; background-color: #f9f9f9; border-top: 1px solid #eee; font-size: 10px; color: #666; text-align: center;">
                    Item #${index + 1} | Category: ${item.item.category || 'General'}
                </div>
            </div>
            `).join('')}
        </div>

        <!-- Print Timestamp -->
        <div style="margin-top: 12px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 8px;" class="no-break">
            Printed: ${new Date().toLocaleString('en-GB')} | Gahez Kitchen System
        </div>

    </body>
    </html>
    `;
};

export default orderItemsTemplate;
