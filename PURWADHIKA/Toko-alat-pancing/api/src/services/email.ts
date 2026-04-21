import { Resend } from 'resend';
import { config } from '../config';

const resend = new Resend(config.resend.apiKey);

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
}

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export const sendOrderConfirmationToCustomer = async (data: OrderEmailData) => {
  const itemsHtml = data.items
    .map(
      (i) => `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatRp(i.price)}</td>
    </tr>`
    )
    .join('');

  await resend.emails.send({
    from: config.resend.from,
    to: data.customerEmail,
    subject: `Pesanan #${data.orderNumber} Diterima - Toko Pancing`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0F766E;padding:20px;text-align:center">
          <h1 style="color:white;margin:0">Toko Pancing</h1>
        </div>
        <div style="padding:24px">
          <h2>Pesanan Berhasil Dibuat!</h2>
          <p>Halo <strong>${data.customerName}</strong>,</p>
          <p>Pesanan Anda dengan nomor <strong>#${data.orderNumber}</strong> telah kami terima. Silakan lakukan pembayaran untuk memproses pesanan Anda.</p>
          <h3>Detail Pesanan</h3>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="padding:8px;text-align:left">Produk</th>
                <th style="padding:8px;text-align:center">Qty</th>
                <th style="padding:8px;text-align:right">Harga</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="margin-top:16px;text-align:right">
            <p>Subtotal: ${formatRp(data.subtotal)}</p>
            <p>Ongkos Kirim: ${formatRp(data.shippingCost)}</p>
            <p><strong>Total: ${formatRp(data.total)}</strong></p>
          </div>
          <h3>Alamat Pengiriman</h3>
          <p>${data.shippingAddress}, ${data.shippingCity}, ${data.shippingProvince}</p>
          <p style="margin-top:24px;color:#666">Terima kasih telah berbelanja di Toko Pancing!</p>
        </div>
      </div>
    `,
  });
};

export const sendNewOrderNotificationToAdmin = async (data: OrderEmailData) => {
  if (!config.resend.adminEmail) return;

  await resend.emails.send({
    from: config.resend.from,
    to: config.resend.adminEmail,
    subject: `[Admin] Pesanan Baru #${data.orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0F766E;padding:20px">
          <h2 style="color:white;margin:0">Pesanan Baru Masuk!</h2>
        </div>
        <div style="padding:24px">
          <p>Order Number: <strong>#${data.orderNumber}</strong></p>
          <p>Customer: <strong>${data.customerName}</strong> (${data.customerEmail})</p>
          <p>Total: <strong>${formatRp(data.total)}</strong></p>
          <p>Alamat: ${data.shippingAddress}, ${data.shippingCity}, ${data.shippingProvince}</p>
          <p>Silakan masuk ke <a href="${config.cors.adminUrl}">Admin Panel</a> untuk memproses pesanan.</p>
        </div>
      </div>
    `,
  });
};

export const sendShippingUpdateToCustomer = async (data: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  courier: string;
  trackingNumber: string;
}) => {
  await resend.emails.send({
    from: config.resend.from,
    to: data.customerEmail,
    subject: `Pesanan #${data.orderNumber} Sudah Dikirim!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0F766E;padding:20px;text-align:center">
          <h1 style="color:white;margin:0">Toko Pancing</h1>
        </div>
        <div style="padding:24px">
          <h2>Pesanan Anda Sedang Dalam Perjalanan!</h2>
          <p>Halo <strong>${data.customerName}</strong>,</p>
          <p>Pesanan <strong>#${data.orderNumber}</strong> telah dikirimkan.</p>
          <div style="background:#f0fdf4;padding:16px;border-radius:8px;margin:16px 0">
            <p style="margin:4px 0"><strong>Kurir:</strong> ${data.courier}</p>
            <p style="margin:4px 0"><strong>No. Resi:</strong> ${data.trackingNumber}</p>
          </div>
          <p>Gunakan nomor resi di atas untuk melacak paket Anda.</p>
        </div>
      </div>
    `,
  });
};
