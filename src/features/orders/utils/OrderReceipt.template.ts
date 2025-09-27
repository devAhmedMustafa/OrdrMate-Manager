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
    const tax = subtotal * 0.14; // 14% tax (adjust as needed)
    const total = order.totalAmount || subtotal + tax;

    // Format date
    const orderDate = new Date(order.orderDate || '');
    const formattedDate = orderDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = orderDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
        <div style="
            max-width: 400px; 
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
            <div style="text-align: center; margin-bottom: 18px;">
                <h2 style="margin: 5px 0; color: black; font-size: 20px;">${branchInfo.restaurantName}</h2>
                ${branchInfo.address ? `<p style="margin: 3px 0; color: black; font-size: 14px;">Address: ${branchInfo.address}</p>` : ''}
                ${branchInfo.phone ? `<p style="margin: 3px 0; color: black; font-size: 14px;">Phone: ${branchInfo.phone}</p>` : ''}
            </div>

            <!-- Order Info -->
            <div style="border: 1px solid black; padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: bold;">Order #:</span>
                    <span>${order.orderId.substring(0, 8).toUpperCase()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; align-items: flex-start;">
                    <span style="font-weight: bold; min-width: 80px;">Customer:</span>
                    <span style="text-align: right; word-wrap: break-word; overflow-wrap: break-word; max-width: 200px; flex: 1; margin-left: 10px;">${order.customer || 'Walk-in'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: bold;">Date:</span>
                    <span>${formattedDate}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: bold;">Time:</span>
                    <span>${formattedTime}</span>
                </div>
                ${order.orderType ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-weight: bold;">Type:</span>
                    <span>${order.orderType}${order.tableNumber ? ` - Table ${order.tableNumber}` : ''}</span>
                </div>
                ` : ''}
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
                    <span>Tax (14%):</span>
                    <span>L.E.${tax.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: black; padding-top: 8px; border-top: 1px solid black;">
                    <span>TOTAL:</span>
                    <span>L.E.${total.toFixed(2)}</span>
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
                <div style="position: absolute; bottom: -10px; right: 0; text-align: center;">
                    <p style="margin: 0 0 3px 0; font-size: 9px; color: black;">Scan to order</p>
                    <img src="${qrCodeUrl}" alt="QR Code for Menu" style="width: 90px; height: 90px;"/>
                </div>
                ` : ''}
            </div>
        </div>
    `;
};

export default orderTemplate;