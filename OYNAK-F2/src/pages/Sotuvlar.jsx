import { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Tag,
  Spin,
  Select,
  Space,
  DatePicker,
  Popover,
  Button,
} from "antd";
import { useGetSalesQuery } from "../features/api/sales.api";
import { FaPrint, FaRegEye } from "react-icons/fa";
import { useMemo } from "react";
import moment from "moment";

const { Title } = Typography;
const { Option } = Select;

export default function Sotuvlar() {
  const { data, isLoading, error, refetch } = useGetSalesQuery();
  const [filterType, setFilterType] = useState("all");
  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));

  useEffect(() => {
    refetch();
  }, [refetch]);

  const filteredData =
    data?.data?.filter((sale) => {
      const matchType = filterType === "all" ? true : sale.type === filterType;
      const matchDate =
        !startDate || !endDate
          ? true
          : moment(sale.sold_at).isSameOrAfter(startDate, "day") &&
            moment(sale.sold_at).isSameOrBefore(endDate, "day");
      return matchType && matchDate;
    }) || [];

  const groupedSales = useMemo(() => {
    if (!filteredData.length) return [];

    const groupMap = {};

    filteredData.forEach((sale) => {
      const minuteKey = moment(sale.sold_at).format("YYYY-MM-DD HH:mm");
      const clientKey = sale.client_id?._id || "unknown";

      const groupKey = `${clientKey}-${minuteKey}`;

      if (!groupMap[groupKey]) {
        groupMap[groupKey] = {
          _id: groupKey,
          client_id: sale.client_id,
          sold_at: sale.sold_at,
          sales: [],
          total_kv: 0,
          total_quantity: 0,
          total_price: 0,
          type: sale.type,
        };
      }

      groupMap[groupKey].sales.push(sale);
      groupMap[groupKey].total_kv += sale.kv;
      groupMap[groupKey].total_quantity += sale.quantity;
      groupMap[groupKey].total_price += sale.kv * sale.price;
    });

    return Object.values(groupMap);
  }, [filteredData]);

  const umumiySumma = groupedSales.reduce(
    (acc, sale) => acc + sale.total_price,
    0
  );
  function handlePrint(record) {
    const win = window.open("", "PRINT", "height=700,width=900");

    const date = new Date(record.sold_at).toLocaleDateString();
    const client = record.client_id;

    const grouped = {};
    for (const sale of record.sales) {
      const name = sale.product_id.name + " - " + sale.price.toLocaleString();
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(sale);
    }

    const tables = Object.entries(grouped)
      .map(([productTitle, sales]) => {
        const rows = sales
          .map(
            (s) => `
          <tr>
            <td>${s.width}</td>
            <td>${s.height}</td>
            <td>${s.quantity}</td>
            <td>${(s.width * s.height).toFixed(5)}</td>
            <td>${s.kv.toFixed(6)}</td>
          </tr>`
          )
          .join("");

        const totalM2 = sales.reduce((acc, s) => acc + s.kv, 0).toFixed(6);
        const totalSum = sales.reduce((acc, s) => acc + s.total, 0).toFixed(2);

        return `
        <tr><td colspan="5"><strong>${productTitle}</strong></td></tr>
        <tr>
          <th>L</th>
          <th>H</th>
          <th>Soni</th>   
          <th>m2</th>
          <th>jami m2</th>
        </tr>
        ${rows}
        <tr>
          <td colspan="4"></td>
          <td><strong>${totalM2}</strong></td>
        </tr>
        <tr>
          <td colspan="4"></td>
          <td><strong>${parseFloat(totalSum).toLocaleString()}</strong></td>
        </tr>
      `;
      })
      .join("");

    const totalPrice = record.total_price.toLocaleString();

    const html = `
    <html>
      <head>
        <title>Print</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #000;
            padding: 5px;
            text-align: center;
          }
          h2, h4 {
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <h2>master glass +998 (94) 183-36-30</h2>
        <br />
        <h2>${record.client_id.name}</h2>
        <br />
        <h2>${date}</h2>
        <br />
        <table>
          ${tables}
        </table>  
        <table>
          <tr>
            <td colspan="8"></td>
            <td colspan="1"><strong>${totalPrice}</strong></td>
          </tr>
        </table>
      </body>
    </html>
  `;

    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }

  // const columns = [
  //   { title: "📦 Mahsulot", dataIndex: ["product_id", "name"], key: "product" },
  //   { title: "Xaridor", dataIndex: ["client_id", "name"], key: "client" },
  //   { title: "📐 Eni (m)", dataIndex: "width", key: "width" },
  //   { title: "📏 Bo'yi (m)", dataIndex: "height", key: "height" },
  //   { title: "Soni", dataIndex: "quantity", key: "quantity" },
  //   { title: "📏 Kv.m", dataIndex: "kv", key: "kv" },
  //   {
  //     title: "💰 Narx",
  //     dataIndex: "price",
  //     key: "price",
  //     render: (v) => `${v.toLocaleString()} so'm`,
  //   },
  //   {
  //     title: "💳 To'lov turi",
  //     dataIndex: "type",
  //     key: "type",
  //     render: (type) => {
  //       let color = "blue";
  //       if (type === "naxt") color = "green";
  //       if (type === "qarz") color = "red";
  //       return <Tag color={color}>{type.toUpperCase()}</Tag>;
  //     },
  //   },
  //   {
  //     title: "Qo'shimcha xizmatlar",
  //     dataIndex: "extra_services",
  //     render: (text) => (
  //       <Popover
  //         trigger="click"
  //         content={
  //           <Table
  //             columns={[
  //               {
  //                 title: "Xizmat nomi",
  //                 dataIndex: "service_name",
  //               },
  //               {
  //                 title: "Narxi",
  //                 dataIndex: "service_amount",
  //                 render: (amount) => `${amount.toLocaleString()} so'm`,
  //               },
  //             ]}
  //             dataSource={text}
  //             pagination={false}
  //             rowKey="_id"
  //           />
  //         }
  //       >
  //         <Button type="primary">
  //           <FaRegEye />
  //         </Button>
  //       </Popover>
  //     ),
  //   },
  //   {
  //     title: "📅 Sotilgan sana",
  //     dataIndex: "sold_at",
  //     key: "sold_at",
  //     render: (date) => new Date(date).toLocaleString("uz-UZ"),
  //   },
  // ];

  const columns = [
    { title: "Xaridor", dataIndex: ["client_id", "name"], key: "client" },
    {
      title: "📅 Sotilgan vaqt",
      dataIndex: "sold_at",
      render: (date) => moment(date).format("YYYY-MM-DD HH:mm"),
    },
    { title: "📏 Jami Kv", dataIndex: "total_kv" },
    { title: "Jami Soni", dataIndex: "total_quantity" },
    {
      title: "💰 Umumiy narx",
      dataIndex: "total_price",
      render: (v) => `${v.toLocaleString()} so'm`,
    },
    {
      title: "💳 To'lov turi",
      dataIndex: "type",
      render: (type) => {
        let color = "blue";
        if (type === "naxt") color = "green";
        if (type === "qarz") color = "red";
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Chop etish",
      render: (_, record) => (
        <Button type="primary" onClick={() => handlePrint(record)}>
          <FaPrint />
        </Button>
      ),
    },
  ];

  const expandedRowRender = (record) => (
    <Table
      columns={[
        { title: "Mahsulot", dataIndex: ["product_id", "name"] },
        { title: "Eni", dataIndex: "width" },
        { title: "Bo'yi", dataIndex: "height" },
        { title: "Soni", dataIndex: "quantity" },
        { title: "Kv", dataIndex: "kv" },
        {
          title: "Narx",
          dataIndex: "price",
          render: (v) => `${v.toLocaleString()} so'm`,
        },
        {
          title: "Qo'shimcha xizmatlar",
          dataIndex: "extra_services",
          render: (text) => (
            <Popover
              trigger="click"
              content={
                <Table
                  columns={[
                    { title: "Xizmat nomi", dataIndex: "service_name" },
                    {
                      title: "Narxi",
                      dataIndex: "service_amount",
                      render: (amount) => `${amount.toLocaleString()} so'm`,
                    },
                  ]}
                  dataSource={text}
                  pagination={false}
                  rowKey="_id"
                />
              }
            >
              <Button type="primary">
                <FaRegEye />
              </Button>
            </Popover>
          ),
        },
      ]}
      dataSource={record.sales}
      pagination={false}
      rowKey="_id"
    />
  );
  console.log(groupedSales);

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>🧾 Sotuvlar Tarixi</Title>

      <Space
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
        size={[8, 8]}
      >
        <Space>
          <Select
            value={filterType}
            onChange={setFilterType}
            style={{ width: 180 }}
          >
            <Option value="all">Barchasi</Option>
            <Option value="naxt">Naxt</Option>
            <Option value="karta">Karta</Option>
            <Option value="qarz">Qarz</Option>
          </Select>
          <input
            style={{
              border: "1px solid #ccc",
              height: "32px",
              paddingInline: "5px",
              borderRadius: "5px",
            }}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            style={{
              border: "1px solid #ccc",
              height: "32px",
              paddingInline: "5px",
              borderRadius: "5px",
            }}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Space>
        <Title level={5} style={{ margin: 0 }}>
          Umumiy summa: {umumiySumma.toLocaleString()} so'm
        </Title>
      </Space>

      {isLoading ? (
        <Spin size="large" />
      ) : error ? (
        <p style={{ color: "red" }}>Xatolik yuz berdi</p>
      ) : (
        <Table
          dataSource={groupedSales}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          bordered
          expandable={{ expandedRowRender }}
        />
      )}
    </div>
  );
}
