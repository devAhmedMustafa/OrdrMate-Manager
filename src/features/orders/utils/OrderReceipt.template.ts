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
                <div style="text-align: center; margin-bottom: 10px;">
                    <img src="/OrdrMate.png" alt="OrdrMate Logo" style="width: 60px; height: 60px; object-fit: contain; margin: 0 10px;"/>
                    ${branchInfo.logoUrl ? `<img src="${branchInfo.logoUrl}" alt="Restaurant Logo" style="width: 60px; height: 60px; object-fit: contain; margin: 0 10px;"/>` : ''}
                </div>
                <h1 style="margin: 0; color: black; font-size: 24px;">RECEIPT</h1>
            </div>

            <!-- Restaurant Info -->
            <div style="text-align: center; margin-bottom: 15px;">
                <h2 style="margin: 5px 0; color: black; font-size: 20px;">${branchInfo.restaurantName}</h2>
                ${branchInfo.address ? `<div style="font-size: 12px; color: black; margin: 3px 0;">${branchInfo.address}</div>` : ''}
                ${branchInfo.phone ? `<div style="font-size: 12px; color: black; margin: 3px 0;">${branchInfo.phone}</div>` : ''}
            </div>

            <!-- Order Info -->
            <div style="border: 1px solid black; padding: 10px; margin-bottom: 15px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="text-align: left; padding: 2px 5px; font-size: 14px; width: 50%;">${order.orderId.substring(0, 8).toUpperCase()}</td>
                        <td style="text-align: right; padding: 2px 5px; font-size: 14px; width: 50%;">${cleanCustomerName(order.customer || 'Walk-in')}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding: 2px 5px; font-size: 14px; width: 50%;">${formattedDateTime}</td>
                        <td style="text-align: right; padding: 2px 5px; font-size: 14px; width: 50%;">
                            ${order.orderType ? `${order.orderType}${order.tableNumber ? ` - Table ${order.tableNumber}` : ''}` : ''}
                        </td>
                    </tr>
                </table>
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
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="text-align: left; padding: 4px 0; font-size: 14px;">Subtotal:</td>
                        <td style="text-align: right; padding: 4px 0; font-size: 14px;">L.E.${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding: 4px 0; font-size: 14px;">Service Charge (%${branchInfo.taxRate * 100}):</td>
                        <td style="text-align: right; padding: 4px 0; font-size: 14px;">L.E.${(subtotal * branchInfo.taxRate).toFixed(2)}</td>
                    </tr>
                    <tr style="border-top: 1px solid black;">
                        <td style="text-align: left; padding: 8px 0 4px 0; font-size: 18px; font-weight: bold; color: black;">TOTAL:</td>
                        <td style="text-align: right; padding: 8px 0 4px 0; font-size: 18px; font-weight: bold; color: black;">L.E.${order.totalAmount.toFixed(2)}</td>
                    </tr>
                </table>
            </div>

            <!-- Footer -->
            <div style="margin-top: 22px; padding-top: 12px; border-top: 1px solid black;">
                <div style="text-align: center;">
                    <p style="margin: 5px 0; font-size: 16px; color: black; font-weight: bold;">Thank you for your order!</p>
                    <p style="margin: 5px 0; font-size: 12px; color: black;">Please keep this receipt for your records</p>
                    <p style="margin: 15px 0 5px 0; font-size: 12px; color: black;">Powered by <strong>Gahez</strong></p>
                </div>
                ${qrCodeUrl ? `
                <div style="text-align: center; margin: 10px auto;">
                    <img src="${qrCodeUrl}" alt="QR Code for Menu" style="width: 90px; height: 90px; display: block; margin: 0 auto;"/>
                    <p style="margin: 3px 0 0 0; font-size: 9px; color: black;">Scan to order</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;
};

export default orderTemplate;
