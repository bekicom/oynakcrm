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
import { FaRegEye } from "react-icons/fa";
import moment from "moment";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

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

  const umumiySumma = filteredData.reduce(
    (acc, sale) => acc + sale.kv * sale.price,
    0
  );

  const columns = [
    { title: "📦 Mahsulot", dataIndex: ["product_id", "name"], key: "product" },
    { title: "📐 Eni (m)", dataIndex: "width", key: "width" },
    { title: "📏 Bo'yi (m)", dataIndex: "height", key: "height" },
    { title: "📏 Kv.m", dataIndex: "kv", key: "kv" },
    {
      title: "💰 Narx",
      dataIndex: "price",
      key: "price",
      render: (v) => `${v.toLocaleString()} so'm`,
    },
    {
      title: "💳 To'lov turi",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let color = "blue";
        if (type === "naxt") color = "green";
        if (type === "qarz") color = "red";
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
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
                {
                  title: "Xizmat nomi",
                  dataIndex: "service_name",
                },
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
    {
      title: "📅 Sotilgan sana",
      dataIndex: "sold_at",
      key: "sold_at",
      render: (date) => new Date(date).toLocaleString("uz-UZ"),
    },
  ];

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
          dataSource={filteredData}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          bordered
        />
      )}
    </div>
  );
}
