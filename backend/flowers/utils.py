import os
from django.core.mail import EmailMessage


from .templates import Templates

def send_order_email(to, order):
    """
    Send the order completed email to the customer.
    `order` is an instance of your Order model.
    """

    # Build items rows for the table
    items_rows = ""
    for item in order.items.all():  # assuming items is related name
        items_rows += f"""
        <tr>
            <td>{item.flower.name}</td>
            <td>{item.quantity}</td>
            <td>{item.flower.price_amd}</td>
        </tr>
        """

    # Fill template
    subject = Templates.OrderCompletedTemplate.subject.format(customer_name=order.customer_name)
    body = Templates.OrderCompletedTemplate.body.format(
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        delivery_city=order.delivery_city,
        delivery_address=order.delivery_address,
        delivery_notes=order.delivery_notes or "-",
        payment_method=order.payment_method,
        total_amount_amd=order.total_amount_amd,
        created_at=order.created_at.strftime("%Y-%m-%d %H:%M"),
        items_rows=items_rows
    )

    email = EmailMessage(
        subject=subject,
        body=body,
        from_email=os.getenv('EMAIL_HOST_USER'),
        to=[to],
    )
    email.content_subtype = "html"
    email.send()
    print('email sent ')