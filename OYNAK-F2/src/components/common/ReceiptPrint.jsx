// 📁 components/ReceiptPrint.jsx

import React, { forwardRef } from "react";
import { Typography } from "antd";

const { Title, Text } = Typography;

const ReceiptPrint = forwardRef(({ receipt }, ref) => {
  const { productName, width, height, price, kv, total, client, date } =
    receipt;

  return (
    <div ref={ref} style={{ padding: 20, fontFamily: "monospace" }}>
      <Title level={4} style={{ textAlign: "center", marginBottom: 16 }}>
        🧾 Sotuv Cheki
      </Title>

      <div style={{ marginBottom: 10 }}>
        <Text strong>Mahsulot nomi:</Text> <Text>{productName}</Text>
      </div>
      <div>
        <Text strong>O‘lchami:</Text>{" "}
        <Text>
          {width}m x {height}m
        </Text>
      </div>
      <div>
        <Text strong>Maydon (kv.m):</Text> <Text>{kv}</Text>
      </div>
      <div>
        <Text strong>1m² narxi:</Text>{" "}
        <Text>{price.toLocaleString()} so‘m</Text>
      </div>
      <div>
        <Text strong>Jami:</Text> <Text>{total.toLocaleString()} so‘m</Text>
      </div>

      {client && (
        <>
          <div style={{ marginTop: 10 }}>
            <Text strong>👤 Qarzdor:</Text> <Text>{client.name}</Text>
          </div>
          <div>
            <Text strong>📞 Tel:</Text> <Text>{client.phone}</Text>
          </div>
          <div>
            <Text strong>📍 Manzil:</Text> <Text>{client.address}</Text>
          </div>
          <div>
            <Text strong>🗓 To‘lash muddati:</Text>{" "}
            <Text>{client.due_date}</Text>
          </div>
        </>
      )}

      <div style={{ marginTop: 20 }}>
        <Text strong>📅 Sana:</Text> <Text>{date}</Text>
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Text>Raxmat! Yana tashrif buyuring! 😊</Text>
      </div>
    </div>
  );
});

export default ReceiptPrint;
