import { BranchInfoResponse } from "../../restaurant_branches/services/branchService";
import Order from "../models/Order";
import { generateQRCode } from "../../../utils/qr-generator";

const orderTemplate = async (order: Order, branchInfo: BranchInfoResponse): Promise<string> => {
    // Generate QR code for the customer app
    const customerAppUrl = `${import.meta.env.VITE_CUSTOMER_APP_URL}/branch/${order.branchId}`;
    let qrCodeUrl = '';
    
    try {
        qrCodeUrl = await generateQRCode(customerAppUrl);
    } catch (error) {
        console.error('Failed to generate QR code for receipt:', error);
    }

    // Calculate totals
    const subtotal = order.orderItems.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);

    // Clean customer name (remove domain from email)
    const cleanCustomerName = (customer: string): string => {
        if (!customer || customer === 'Walk-in') return 'Walk-in';
        // If it's an email, extract only the username part
        if (customer.includes('@')) {
            return customer.split('@')[0];
        }
        return customer;
    };

    // Format date and time in one line
    const orderDate = new Date(order.orderDate || '');
    const formattedDateTime = orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) + ' ' + orderDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

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
                table {
                    page-break-inside: auto;
                }
                tr, td, th {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }
            }
        </style>
        <div style="
            max-width: 600px; 
            margin: 0 auto; 
            font-family: 'Arial', sans-serif; 
            color: black;
            background: white;
            padding: 20px;
        ">
            <!-- Header -->
            <div style="text-align: center; border-bottom: 2px solid black; padding-bottom: 15px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 10px;">
                    <img src="/OrdrMate.png" alt="OrdrMate Logo" style="width: 60px; height: 60px; object-fit: contain;"/>
                    ${branchInfo.logoUrl ? `<img src="${branchInfo.logoUrl}" alt="Restaurant Logo" style="width: 60px; height: 60px; object-fit: contain;"/>` : ''}
                </div>
                <h1 style="margin: 0; color: black; font-size: 24px;">RECEIPT</h1>
            </div>

            <!-- Restaurant Info -->
            <div style="text-align: center; margin-bottom: 15px;">
                <h2 style="margin: 5px 0; color: black; font-size: 20px;">${branchInfo.restaurantName}</h2>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: black; margin-top: 5px;">
                    ${branchInfo.address ? `<span style="text-align: left; flex: 1;">${branchInfo.address}</span>` : '<span style="flex: 1;"></span>'}
                    ${branchInfo.phone ? `<span style="text-align: right; flex: 1;">${branchInfo.phone}</span>` : '<span style="flex: 1;"></span>'}
                </div>
            </div>

            <!-- Order Info -->
            <div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 14px; width: 100%;">
                    <span style="text-align: left; flex: 1; padding-right: 10px;">${order.orderId.substring(0, 8).toUpperCase()}</span>
                    <span style="text-align: right; flex: 1; padding-left: 10px;">${cleanCustomerName(order.customer || 'Walk-in')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; font-size: 14px; width: 100%;">
                    <span style="text-align: left; flex: 1; padding-right: 10px;">${formattedDateTime}</span>
                    ${order.orderType ? `<span style="text-align: right; flex: 1; padding-left: 10px;">${order.orderType}${order.tableNumber ? ` - Table ${order.tableNumber}` : ''}</span>` : '<span style="text-align: right; flex: 1; padding-left: 10px;"></span>'}
                </div>
            </div>

            <!-- Order Items -->
            <div style="margin-bottom: 15px;">
                <h3 style="color: black; border-bottom: 1px solid black; padding-bottom: 8px; margin-bottom: 12px;">ORDER ITEMS</h3>
                <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
                    <thead>
                        <tr style="border-bottom: 2px solid black;">
                            <th style="text-align: left; padding: 8px; font-size: 14px; color: black; border-right: 1px solid black;">Item</th>
                            <th style="text-align: center; padding: 8px; font-size: 14px; color: black; border-right: 1px solid black;">Qty</th>
                            <th style="text-align: right; padding: 8px; font-size: 14px; color: black; border-right: 1px solid black;">Price</th>
                            <th style="text-align: right; padding: 8px; font-size: 14px; color: black;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.orderItems.map(item => `
                        <tr style="border-bottom: 1px solid black;">
                            <td style="padding: 10px 8px; font-size: 14px; border-right: 1px solid black; word-wrap: break-word; overflow-wrap: break-word; max-width: 150px;">
                                <strong>${item.item.name}</strong>
                                <br><small style="color: #666; font-size: 12px;">${item.item.category}</small>
                            </td>
                            <td style="text-align: center; padding: 10px 8px; font-size: 14px; border-right: 1px solid black;">${item.quantity}</td>
                            <td style="text-align: right; padding: 10px 8px; font-size: 14px; border-right: 1px solid black;">L.E.${item.item.price.toFixed(2)}</td>
                            <td style="text-align: right; padding: 10px 8px; font-size: 14px; font-weight: bold;">L.E.${(item.item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Totals -->
            <div style="border-top: 2px solid black; padding-top: 12px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                    <span>Subtotal:</span>
                    <span>L.E.${subtotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                    <span>Service Charge (%${branchInfo.taxRate}):</span>
                    <span>L.E.${branchInfo.taxRate.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: black; padding-top: 8px; border-top: 1px solid black;">
                    <span>TOTAL:</span>
                    <span>L.E.${order.totalAmount.toFixed(2)}</span>
                </div>
            </div>

            <!-- Footer -->
            <div style="margin-top: 22px; padding-top: 12px; border-top: 1px solid black; position: relative;">
                <div style="text-align: center;">
                    <p style="margin: 5px 0; font-size: 16px; color: black; font-weight: bold;">Thank you for your order!</p>
                    <p style="margin: 5px 0; font-size: 12px; color: black;">Please keep this receipt for your records</p>
                    <p style="margin: 15px 0 5px 0; font-size: 12px; color: black;">Powered by <strong>Gahez</strong></p>
                </div>
                ${qrCodeUrl ? `
                <div style="text-align: center; margin: auto">
                <img src="${qrCodeUrl}" alt="QR Code for Menu" style="width: 90px; height: 90px;"/>
                    <p style="margin: 0 0 3px 0; font-size: 9px; color: black;">Scan to order</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;
};

export default orderTemplate;
