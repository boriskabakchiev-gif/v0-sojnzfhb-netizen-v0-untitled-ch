import nodemailer from "nodemailer"

export const sendEmail = sendOrderNotificationEmail

export async function sendOrderNotificationEmail(orderData: any) {
  console.log("Email: Starting email sending process")

  try {
    // Create transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    console.log("Email: Transporter created successfully")

    // Verify connection
    await transporter.verify()
    console.log("Email: SMTP connection verified")

    // Generate order items HTML
    const itemsHtml = orderData.items
      .map(
        (item: any) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; text-align: left;">
          ${item.photourl ? `<img src="${item.photourl}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 12px; vertical-align: middle;">` : ""}
          <strong>${item.title}</strong>
        </td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">${item.price.toFixed(2)} лв.</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">${(item.price * item.quantity).toFixed(2)} лв.</td>
        ${item.freeItems > 0 ? `<td style="padding: 12px; text-align: center; color: #16a34a; font-weight: bold;">+${item.freeItems} безплатно</td>` : "<td></td>"}
      </tr>
    `,
      )
      .join("")

    // Create HTML email content
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Нова поръчка - ${orderData.orderId}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Нова поръчка!</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px;">Поръчка #${orderData.orderId}</p>
      </div>

      <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
        <h2 style="color: #1e40af; margin-top: 0;">👤 Информация за клиента</h2>
        <p><strong>Име:</strong> ${orderData.customerName}</p>
        <p><strong>Телефон:</strong> ${orderData.customerPhone}</p>
        ${orderData.additionalInfo ? `<p><strong>Допълнителна информация:</strong> ${orderData.additionalInfo}</p>` : ""}
        ${orderData.isEuropeanCustomer ? "<p><strong>Тип клиент:</strong> 🇪🇺 Европейски</p>" : "<p><strong>Тип клиент:</strong> 🇧🇬 Български</p>"}
      </div>

      <div style="background: white; border: 2px solid #e5e7eb; border-radius: 10px; overflow: hidden; margin-bottom: 25px;">
        <h2 style="background: #3b82f6; color: white; margin: 0; padding: 20px; font-size: 20px;">🛍️ Поръчани продукти</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 15px; text-align: left; border-bottom: 2px solid #e5e7eb;">Продукт</th>
              <th style="padding: 15px; text-align: center; border-bottom: 2px solid #e5e7eb;">Количество</th>
              <th style="padding: 15px; text-align: right; border-bottom: 2px solid #e5e7eb;">Цена</th>
              <th style="padding: 15px; text-align: right; border-bottom: 2px solid #e5e7eb;">Общо</th>
              <th style="padding: 15px; text-align: center; border-bottom: 2px solid #e5e7eb;">Безплатни</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
        <h2 style="color: #059669; margin-top: 0;">💰 Обобщение на цените</h2>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Междинна сума:</span>
          <span style="font-weight: bold;">${orderData.originalTotalPrice.toFixed(2)} лв.</span>
        </div>
        ${
          orderData.discountAmount > 0
            ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #16a34a;">
          <span>Отстъпка (${orderData.discountPercent}%):</span>
          <span style="font-weight: bold;">-${orderData.discountAmount.toFixed(2)} лв.</span>
        </div>
        `
            : ""
        }
        <hr style="border: none; border-top: 2px solid #10b981; margin: 15px 0;">
        <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; color: #059669;">
          <span>Крайна сума:</span>
          <span>${orderData.totalAmount.toFixed(2)} лв.</span>
        </div>
      </div>

      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; text-align: center;">
        <p style="margin: 0; color: #92400e; font-weight: bold;">⚠️ Важно: Цените включват ДДС. Окончателната цена и наличност ще бъдат потвърдени след обработка на запитването.</p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 10px;">
        <p style="color: #6b7280; margin: 0;">Това е автоматично генериран имейл от системата за поръчки на Madix</p>
        <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Дата: ${new Date().toLocaleString("bg-BG")}</p>
      </div>
    </body>
    </html>
    `

    // Create plain text version
    const textContent = `
Нова поръчка #${orderData.orderId}

ИНФОРМАЦИЯ ЗА КЛИЕНТА:
Име: ${orderData.customerName}
Телефон: ${orderData.customerPhone}
${orderData.additionalInfo ? `Допълнителна информация: ${orderData.additionalInfo}` : ""}
Тип клиент: ${orderData.isEuropeanCustomer ? "Европейски" : "Български"}

ПОРЪЧАНИ ПРОДУКТИ:
${orderData.items
  .map(
    (item: any) =>
      `- ${item.title} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)} лв.${item.freeItems > 0 ? ` (+${item.freeItems} безплатно)` : ""}`,
  )
  .join("\n")}

ОБОБЩЕНИЕ НА ЦЕНИТЕ:
Междинна сума: ${orderData.originalTotalPrice.toFixed(2)} лв.
${orderData.discountAmount > 0 ? `Отстъпка (${orderData.discountPercent}%): -${orderData.discountAmount.toFixed(2)} лв.\n` : ""}Крайна сума: ${orderData.totalAmount.toFixed(2)} лв.

Важно: Цените включват ДДС. Окончателната цена и наличност ще бъдат потвърдени след обработка на запитването.

Дата: ${new Date().toLocaleString("bg-BG")}
    `

    // Send email
    const mailOptions = {
      from: `"Madix Orders" <${process.env.GMAIL_USER}>`,
      to: "bobibonev104@gmail.com",
      subject: `🛍️ Нова поръчка #${orderData.orderId} - ${orderData.totalAmount.toFixed(2)} лв.`,
      text: textContent,
      html: htmlContent,
    }

    console.log("Email: Sending email to:", mailOptions.to)
    const result = await transporter.sendMail(mailOptions)
    console.log("Email: Email sent successfully. Message ID:", result.messageId)

    return { success: true, messageId: result.messageId }
  } catch (error: any) {
    console.error("Email: Failed to send order notification email", error)
    console.error("Email: Error details:", error)
    console.error("Email: Error message:", error.message)
    console.error("Email: Error code:", error.code)
    console.error("Email: Error stack:", error.stack)
    throw error
  }
}
