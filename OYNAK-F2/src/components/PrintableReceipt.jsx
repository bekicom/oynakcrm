// src/components/PrintableReceipt.jsx
import React from "react";

const PrintableReceipt = React.forwardRef(({ client, items, extras }, ref) => {
  const calculateTotal = (item) => {
    const width = item?.width || 0;
    const height = item?.height || 0;
    const quantity = item?.quantity || null;
    const unit_area = item?.unit_area || width * height;
    const price = item?.selling_price || 0;

    const sum =
      quantity != null ? quantity * unit_area * price : width * height * price;
    return {
      usd: item?.currency === "USD" ? sum : 0,
      sum: item?.currency === "SUM" ? sum : 0,
    };
  };

  const total = items.reduce(
    (acc, item) => {
      const { usd, sum } = calculateTotal(item);
      return {
        usd: acc.usd + usd,
        sum: acc.sum + sum,
      };
    },
    { usd: 0, sum: 0 }
  );

  const extraTotal = extras.reduce(
    (acc, item) => acc + Number(item.service_amount),
    0
  );
  const gluePrice =
    items.length > 0 &&
    extras.some((e) => e.service_name === "Yopishtirish xizmati")
      ? extras.find((e) => e.service_name === "Yopishtirish xizmati")
          ?.service_amount
      : 0;

  return (
    <div ref={ref} style={{ padding: 5, fontFamily: "sans-serif" }}>
      <h2>
        Mijoz: {client?.name} | Tel: {client?.phone} | Manzil: {client?.address}
      </h2>

      <table
        border="1"
        cellPadding="8"
        cellSpacing="0"
        width="100%"
        style={{ marginBottom: 16 }}
      >
        <thead>
          <tr>
            <th>Nomi</th>
            <th>Eni</th>
            <th>Bo'yi</th>
            <th>Soni</th>
            <th>1m²</th>
            <th>Valyuta</th>
            <th>1m³ narx</th>
            <th>USD</th>
            <th>SUM</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const width = item?.width || 0;
            const height = item?.height || 0;
            const quantity = item?.quantity || null;
            const unit_area = item?.unit_area || width * height;
            const price = item?.selling_price || 0;
            const totalValue =
              quantity != null
                ? quantity * unit_area * price
                : width * height * price;

            return (
              <tr key={idx}>
                <td>{item?.name}</td>
                <td>{width}</td>
                <td>{height}</td>
                <td>{quantity || ""}</td>
                <td>{unit_area}</td>
                <td>{item?.currency}</td>
                <td>{price}</td>
                <td>{item?.currency === "USD" ? totalValue.toFixed(2) : ""}</td>
                <td>
                  {item?.currency === "SUM" ? totalValue.toLocaleString() : ""}
                </td>
              </tr>
            );
          })}
          <tr>
            <td colSpan="7" style={{ textAlign: "right" }}>
              <strong>Jami:</strong>
            </td>
            <td>
              <strong>{total.usd.toFixed(2)}</strong>
            </td>
            <td>
              <strong>{total.sum.toLocaleString()}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Qo‘shimcha xizmatlar</h3>
      <table border="1" cellPadding="8" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Xizmat nomi</th>
            <th>Summa (so'm)</th>
          </tr>
        </thead>
        <tbody>
          {extras.map((item, idx) => (
            <tr key={idx}>
              <td>{item.service_name}</td>
              <td>{Number(item.service_amount).toLocaleString()}</td>
            </tr>
          ))}
          <tr>
            <td>
              <strong>Jami xizmat:</strong>
            </td>
            <td>
              <strong>{extraTotal.toLocaleString()}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});

export default PrintableReceipt;
