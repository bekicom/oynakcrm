import {
  useGetClientsQuery,
  useCreateClientMutation,
  useMarkDebtAsPaidMutation,
  useAddPartialPaymentMutation,
} from "../features/api/client.api";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Tag,
  Collapse,
  Space,
  Tabs,
  Row,
  Col,
  Popconfirm,
} from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { useGetSalesQuery } from "../features/api/sales.api";

const { Panel } = Collapse;
const { TabPane } = Tabs;

const Clients = () => {
  const { data = {}, isLoading, refetch } = useGetClientsQuery();
  const [createClient] = useCreateClientMutation();
  const [markPaid] = useMarkDebtAsPaidMutation();
  const [addPartial] = useAddPartialPaymentMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [enteredAmount, setEnteredAmount] = useState(null);
  const { data: sales, refetch: saleRefetch } = useGetSalesQuery()
  const salesData = Array.isArray(sales?.data) ? sales.data : [];

  const handleFinish = async (values) => {
    try {
      await createClient(values).unwrap();
      message.success("Yangi mijoz qo'shildi");
      form.resetFields();
      setModalOpen(false);
      refetch();
    } catch (err) {
      message.error("Xatolik: " + (err?.data?.message || "Server xatosi"));
    }
  };

  const handleMarkAsPaid = async (debtId) => {
    try {
      await markPaid(debtId).unwrap();
      message.success("To'liq to'landi deb belgilandi");
      refetch();
      saleRefetch();
    } catch (err) {
      message.error("Xatolik: " + (err?.data?.message || "Server xatosi"));
    }
  };

  const handlePartialPayment = async (debtId, amount) => {
    try {
      await addPartial({ debtId, amount }).unwrap();
      message.success("Qisman to'lov qo'shildi");
      refetch();
      saleRefetch();
      setEnteredAmount(null)
    } catch (err) {
      message.error("Xatolik: " + (err?.data?.message || "Server xatosi"));
    }
  };

  const renderDebts = (record) => {
    const debtData = salesData.filter(s => s.client_id?._id === record._id && s.type === "qarz" && s.remaining > 0);

    return Array.isArray(debtData) && debtData.length > 0 ? (
      <Collapse ghost>
        {debtData.map((debt, index) => {
          const key = `${record._id}-${index}`;
          const remaining = (debt.total + debt.extra_services.reduce((acc, item) => acc + item.service_amount_in_sale_currency, 0)).toFixed(1) - (debt.paid_amount || 0);
          const percentage = ((debt.paid_amount || 0) / debt.total) * 100;

          return (
            <Panel
              header={
                <Space>
                  {debt.product_id.name} - {debt.total} {debt.currency}
                  <Tag color={debt.status === "paid" ? "green" : "red"}>
                    {debt.status === "paid" ? "To'liq to'langan" : "Qarzdor"}
                  </Tag>
                </Space>
              }
              key={index}
            >
              <p>
                Kv.m: <b>{debt.kv} m²</b>
              </p>
              <p>
                Narxi: <b>{debt.price} {debt.currency} </b>
              </p>
              <p>
                Qo'shimcha xizmatlar: <b>{debt.extra_services.reduce((acc, item) => acc + item.service_amount_in_sale_currency, 0).toFixed()} {debt.currency}</b>
              </p>
              <p>
                Umumiy: <b>{(debt.total + debt.extra_services.reduce((acc, item) => acc + item.service_amount_in_sale_currency, 0)).toFixed()} {debt.currency}</b>
              </p>
              <p>
                Qaytarish muddati:{" "}
                {debt.due_date
                  ? dayjs(debt.due_date).format("YYYY-MM-DD")
                  : "—"}
              </p>
              <p>
                To'langan: <b>{debt.paid_amount || 0} {debt.currency}</b>
              </p>
              <p>
                Qolgan: <b>{debt.remaining} {debt.currency}</b>
              </p>
              <p>
                To'lov foizi:{" "}
                <Tag color={percentage >= 100 ? "green" : "orange"}>
                  {percentage.toFixed(1)}%
                </Tag>
              </p>

              {debt.payment_log.length > 0 && (
                <>
                  <b>To'lovlar</b>
                  {debt.payment_log.map((payment, index) => (
                    <div key={index}>
                      <p>
                        {dayjs(payment.date).format("YYYY-MM-DD HH:mm:ss")} -{" "}
                        {payment.amount} {debt.currency || "so'm"}
                      </p>
                    </div>
                  ))}
                </>
              )}

              {debt.status !== "paid" && (
                <Space direction="vertical">
                  <Popconfirm onConfirm={() => handleMarkAsPaid(debt._id)}
                    title="To'liq to'lovni tasdiqlaysizmi?"
                    okText="Ha"
                    cancelText="Yo'q"
                    trigger='click'
                  >
                    <Button
                      type="primary"
                    >
                      To'liq to'lash
                    </Button>
                  </Popconfirm>

                  <Row>
                    <Space>
                      <Col span={12}>
                        <InputNumber
                          min={1}
                          max={remaining}
                          style={{ width: 120 }}
                          value={enteredAmount}
                          placeholder="Qisman to'lov"
                          onChange={(val) =>
                            setEnteredAmount(val)
                          }
                        />
                      </Col>
                      <Col span={12}>
                        <Button
                          type="primary"
                          onClick={() => {
                            handlePartialPayment(debt._id, enteredAmount);
                          }}
                        >
                          Qisman to'lov
                        </Button>

                      </Col>
                    </Space>
                  </Row>
                </Space>
              )}
            </Panel>
          );
        })}
      </Collapse>
    ) : (
      <span style={{ color: "gray" }}>Qarzdorlik yo'q</span>
    );
  };
  const renderFinishedDebts = (record) => {
    const debtData = salesData.filter(s => s.client_id?._id === record._id && s.payment_log.length > 0 && s.remaining === 0);

    return Array.isArray(debtData) && debtData.length > 0 ? (
      <Collapse ghost>
        {debtData.map((debt, index) => {
          const key = `${record._id}-${index}`;
          const remaining = debt.total - (debt.paid_amount || 0);
          const percentage = ((debt.paid_amount || 0) / debt.total) * 100;

          return (
            <Panel
              header={
                <Space>
                  {debt.product_id.name} - {debt.total}
                  <Tag color={debt.remaining === 0 ? "green" : "red"}>
                    {debt.remaining === 0 ? "To'liq to'langan" : "Qarzdor"}
                  </Tag>
                </Space>
              }
              key={index}
            >
              <p>
                Kv.m: <b>{debt.kv}</b>
              </p>
              <p>
                Narxi: <b>{debt.price} </b>
              </p>
              <p>
                Umumiy: <b>{debt.total} </b>
              </p>
              <p>
                Qaytarish muddati:{" "}
                {debt.due_date
                  ? dayjs(debt.due_date).format("YYYY-MM-DD")
                  : "—"}
              </p>
              <p>
                To'langan: <b>{debt.paid_amount || 0} </b>
              </p>
              <p>
                Qolgan: <b>{debt.remaining} </b>
              </p>
              <p>
                To'lov foizi:{" "}
                <Tag color={percentage >= 100 ? "green" : "orange"}>
                  {percentage.toFixed(1)}%
                </Tag>
              </p>
              {debt.payment_log.length > 0 && (
                <>
                  <b>To'lovlar</b>
                  {debt.payment_log.map((payment, index) => (
                    <div key={index}>
                      <p>
                        {dayjs(payment.date).format("YYYY-MM-DD HH:mm:ss")} -{" "}
                        {payment.amount} {debt.currency || "so'm"}
                      </p>
                    </div>
                  ))}
                </>
              )}


            </Panel>
          );
        })}
      </Collapse>
    ) : (
      <span style={{ color: "gray" }}>Qarzdorlik yo'q</span>
    );
  };

  const columns = [
    { title: "Ismi", dataIndex: "name" },
    { title: "Telefon", dataIndex: "phone" },
    { title: "Manzil", dataIndex: "address" },
    {
      title: "Qo'shilgan sana",
      dataIndex: "createdAt",
      render: (val) => (val ? new Date(val).toLocaleString("uz-UZ") : "—"),
    },
    // {
    //   title: "Qarzdorliklar",
    //   render: (_, record) => renderDebts(record),
    // },
  ];
  const debtorsColumns = [
    { title: "Ismi", dataIndex: "name" },
    { title: "Telefon", dataIndex: "phone" },
    { title: "Manzil", dataIndex: "address" },
    {
      title: "Qo'shilgan sana",
      dataIndex: "createdAt",
      render: (val) => (val ? new Date(val).toLocaleString("uz-UZ") : "—"),
    },
    {
      title: "Qarzdorliklar",
      render: (_, record) => renderDebts(record),
    },
  ];

  const allClients = Array.isArray(data?.clients) ? data.clients : [];
  const onlyDebtors = allClients.filter((client) =>
    salesData.some(
      (sale) =>
        sale.client_id?._id === client._id &&
        sale.type === "qarz" &&
        sale.remaining > 0
    )
  );
  const onlyFinishedDebtors = allClients.filter((client) =>
    salesData.some(
      (sale) =>
        sale.client_id?._id === client._id &&
        sale.payment_log.length > 0 &&
        sale.remaining === 0
    )
  );

  const finishedDebtors = [
    { title: "Ismi", dataIndex: "name" },
    { title: "Telefon", dataIndex: "phone" },
    { title: "Manzil", dataIndex: "address" },
    {
      title: "Qo'shilgan sana",
      dataIndex: "createdAt",
      render: (val) => (val ? new Date(val).toLocaleString("uz-UZ") : "—"),
    },
    {
      title: "Qarzdorliklar",
      render: (_, record) => renderFinishedDebts(record),
    },
  ]



  return (
    <div style={{ padding: 24 }}>
      <Button
        type="primary"
        onClick={() => setModalOpen(true)}
        style={{ marginBottom: 16 }}
      >
        Yangi mijoz
      </Button>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Barcha mijozlar" key="1">
          <Table
            columns={columns}
            dataSource={allClients}
            rowKey="_id"
            loading={isLoading}
            bordered
          />
        </TabPane>

        <TabPane tab="Faqat qarzdorlar" key="2">
          <Table
            columns={debtorsColumns}
            dataSource={onlyDebtors}
            rowKey="_id"
            loading={isLoading}
            bordered
          />
        </TabPane>
        <TabPane tab="Yopilgan qarzlar" key="3">
          <Table
            columns={finishedDebtors}
            dataSource={onlyFinishedDebtors}
            rowKey="_id"
            loading={isLoading}
            bordered
          />
        </TabPane>
      </Tabs>
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        title="Yangi mijoz"
        okText="Saqlash"
        cancelText="Bekor qilish"
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="name"
            label="Ismi"
            rules={[{ required: true, message: "Ism majburiy" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Telefon"
            rules={[{ required: true, message: "Telefon raqam majburiy" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Manzil">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Clients;
