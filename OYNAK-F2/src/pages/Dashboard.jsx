import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Spin,
  DatePicker,
  message,
} from "antd";
import dayjs from "dayjs";
import {
  DollarOutlined,
  CreditCardOutlined,
  ShoppingOutlined,
  AreaChartOutlined,
  RiseOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { useGetStatsByRangeQuery } from "../features/api/sales.api";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const [range, setRange] = useState([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

  const from = range[0]?.format("YYYY-MM-DD");
  const to = range[1]?.format("YYYY-MM-DD");

  const { data, isLoading, error } = useGetStatsByRangeQuery({ from, to });

  const handleRangeChange = (dates) => {
    if (!dates) return message.warning("Sanani tanlang");
    setRange(dates);
  };

  const cardData = [
    {
      title: "Naxt tushum",
      value: data?.naxt_tushum || 0,
      icon: <DollarOutlined />,
      color: "#ffffff",
      background: "#096b3b",
      suffix: "so'm",
    },
    {
      title: "Karta tushum",
      value: data?.karta_tushum || 0,
      icon: <CreditCardOutlined />,
      color: "#ffffff",
      background: "#0050b3",
      suffix: "so'm",
    },
    {
      title: "Qarzga sotilgan",
      value: data?.qarzga_sotilgan || 0,
      icon: <ShoppingOutlined />,
      color: "#ffffff",
      background: "#a8071a",
      suffix: "so'm",
    },
    {
      title: "Sotilgan kv.m",
      value: data?.sotilgan_kv || 0,
      icon: <AreaChartOutlined />,
      color: "#ffffff",
      background: "#006d75",
      suffix: "kv.m",
    },
    {
      title: "Sotuvlar soni",
      value: data?.sotuvlar_soni || 0,
      icon: <FileDoneOutlined />,
      color: "#ffffff",
      background: "#391085",
      suffix: "ta",
    },
    {
      title: "Foyda",
      value: data?.foyda || 0,
      icon: <RiseOutlined />,
      color: "#ffffff",
      background: "#874d00",
      suffix: "so'm",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: "black" }}>
          📊 Sotuv Statistikasi
        </Title>
        <RangePicker value={range} onChange={handleRangeChange} />
      </Row>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "100px" }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <p style={{ color: "red" }}>Statistikani yuklashda xatolik!</p>
      ) : (
        <Row gutter={[16, 16]}>
          {cardData.map((item, idx) => (
            <Col xs={24} sm={12} md={8} key={idx}>
              <Card
                bordered={false}
                style={{
                  background: item.background,
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  padding: 16,
                }}
              >
                {/* Title alohida yoziladi oq rangda */}
                <div
                  style={{
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: "bold",
                    marginBottom: 8,
                  }}
                >
                  {item.title}
                </div>
                <Statistic
                  value={item.value}
                  prefix={item.icon}
                  valueStyle={{
                    color: item.color,
                    fontWeight: "bold",
                    fontSize: 20,
                  }}
                  suffix={item.suffix}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Dashboard;
