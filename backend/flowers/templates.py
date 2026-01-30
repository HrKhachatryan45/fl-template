class Templates:
    class OrderCompletedTemplate:
        subject = "Your order is completed, {customer_name}"

        body = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Order Receipt</title>
    <style>
        body {{
            margin: 0;
            padding: 0;
            background-color: #f6f6f6;
            font-family: Arial, Helvetica, sans-serif;
        }}
        .container {{
            max-width: 640px;
            margin: 30px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 6px;
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .company-name {{
            font-size: 28px;
            font-weight: bold;
            color: #c62828;
        }}
        .company-phone {{
            font-size: 14px;
            color: #555;
        }}
        h2 {{
            color: #333;
        }}
        .info-table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }}
        .info-table td {{
            padding: 8px 0;
            vertical-align: top;
        }}
        .info-table td:first-child {{
            font-weight: bold;
            color: #444;
            width: 40%;
        }}
        .items-table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
        }}
        .items-table th,
        .items-table td {{
            border-bottom: 1px solid #ddd;
            padding: 10px 0;
            text-align: left;
        }}
        .items-table th {{
            color: #555;
        }}
        .total {{
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
        }}
        .status {{
            margin-top: 20px;
            font-size: 16px;
            color: green;
            font-weight: bold;
            text-align: center;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 3px solid #c62828;
            text-align: center;
            color: #777;
            font-size: 13px;
        }}
    </style>
</head>

<body>
    <div class="container">

        <div class="header">
            <div class="company-name">Dzaghik</div>
            <div class="company-phone">Phone: X</div>
        </div>

        <h2>Պատվերի Կտրոն</h2>

        <p>Հարգելի <strong>{customer_name}</strong>,</p>

        <p>Ձեր պատվերը հաջողությամբ կատարվել է։ Ստորև ներկայացված են ձեր գնման մանրամասները։</p>

        <table class="info-table">
            <tr>
                <td>Պատվերի ամսաթիվը:</td>
                <td>{created_at}</td>
            </tr>
            <tr>
                <td>Առաքման քաղաք:</td>
                <td>{delivery_city}</td>
            </tr>
            <tr>
                <td>Առաքման հասցե:</td>
                <td>{delivery_address}</td>
            </tr>
            <tr>
                <td>Հեռախոսահամար:</td>
                <td>{customer_phone}</td>
            </tr>
            <tr>
                <td>Վճարման եղանակ:</td>
                <td>{payment_method}</td>
            </tr>
            <tr>
                <td>Նշումներ:</td>
                <td>{delivery_notes}</td>
            </tr>
        </table>

       <table class="items-table">
    <thead>
        <tr>
            <th>Ապրանք</th>
            <th>Քանակ</th>
            <th>Գին (AMD)</th>
        </tr>
    </thead>
    <tbody>
        {items_rows}
    </tbody>
</table>

<div class="total">
    Ընդամենը: {total_amount_amd} ֏
</div>

<div class="status">
    Կարգավիճակը: Պատվերը կատարված է
</div>

        <div class="footer">
            <p>Thank you for choosing Dzaghik.</p>
            <p>© 2025 Dzaghik. All rights reserved.</p>
        </div>

    </div>
</body>
</html>
"""