import { useState, useEffect } from "react";
import {
  Layout,
  Row,
  Col,
  Typography,
  AutoComplete,
  InputNumber,
  Button,
  Card,
  Select,
  Modal,
  Form,
  Divider,
  message,
  Statistic,
  Input,
  Switch,
} from "antd";
import {
  ShoppingCartOutlined,
  PlusOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useGetAllProductsQuery } from "../features/api/products.api";
import {
  useGetClientsQuery,
  useCreateClientMutation,
} from "../features/api/client.service";
import { useCreateSaleMutation } from "../features/api/sales.api";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;

export default function Kassa() {
  const [form] = Form.useForm();
  const [clientForm] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [paymentType, setPaymentType] = useState("naxt");
  const [clientModal, setClientModal] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);

  const [enteredWidth, setEnteredWidth] = useState(null);
  const [enteredHeight, setEnteredHeight] = useState(null);
  const [enteredPrice, setEnteredPrice] = useState(null);

  const [extraServices, setExtraServices] = useState([]);
  const [extraModal, setExtraModal] = useState(false);
  const [extraForm] = Form.useForm();
  const [isQuantity, setIsQuantity] = useState(false);
  const [enteredQuantity, setEnteredQuantity] = useState(null);


  const { data: productData } = useGetAllProductsQuery();
  const { data: clientData, refetch } = useGetClientsQuery();
  const [createClient] = useCreateClientMutation();
  const [createSale] = useCreateSaleMutation();
  const navigate = useNavigate();

  const handleProductSearch = (value) => {
    setSearchValue(value);
    const found = productData?.data?.find((p) =>
      p.name.toLowerCase().includes(value.toLowerCase())
    );
    setSelectedProduct(found || null);
    if (found) form.setFieldsValue({ price: found.sell_price });
  };

  const handleClientSearch = (value) => {
    setClientSearch(value);
    const found = clientData?.clients?.find((c) =>
      `${c.name} - ${c.phone}`.toLowerCase().includes(value.toLowerCase())
    );
    setSelectedClient(found || null);
  };

  const handleCreateClient = async (values) => {
    try {
      const response = await createClient(values).unwrap();
      message.success("Mijoz qo'shildi");
      setSelectedClient(response.data);
      setClientSearch(`${response.data.name} - ${response.data.phone}`);
      setClientModal(false);
      clientForm.resetFields();
      refetch();
    } catch (err) {
      message.error("Xatolik: " + (err?.data?.message || "Mijoz saqlanmadi"));
    }
  };
  const handleFinish = async (values) => {
    if (!selectedProduct) return message.warning("Mahsulot tanlanmagan");

    // QARZGA bo'lsa — mijoz majburiy
    if (paymentType === "qarz" && !selectedClient) {
      return message.warning("Qarzga sotish uchun mijoz tanlanishi shart");
    }
    const price = parseFloat(values.price || 0);
    let width
    let height
    if (!values.quantity) {
      width = parseFloat(values.width || 0);
      height = parseFloat(values.height || 0);
    } else {
      width = parseFloat(selectedProduct.width || 0);
      height = parseFloat(selectedProduct.height || 0);
    }

    if (!width || !height || !price) {
      return message.warning("Eni, bo'yi yoki narx noto'g'ri kiritilgan");
    }
    let kv
    if (!values.quantity) {
      kv = width * height;
    } else {
      kv = width * height * values.quantity;
    }
    const purchase_price = selectedProduct?.purchasePrice?.value || 0;
    const profit = (price - purchase_price) * kv;

    const body = {
      product_id: selectedProduct._id,
      price,
      kv,
      type: paymentType,
      width,
      height,
      client_id: selectedClient?._id,
      profit: profit < 0 ? 0 : profit,
      extra_services: extraServices,

    };

    try {
      await createSale(body).unwrap();
      message.success("Sotuv amalga oshirildi");

      form.resetFields();
      setSelectedClient(null);
      setSelectedProduct(null);
      setSearchValue("");
      setClientSearch("");
    } catch (err) {
      message.error(
        "Sotuvda xatolik: " + (err?.data?.message || "Noma'lum xato")
      );
    }
  };


  const handleLogout = () => {
    localStorage.clear();
    message.success("Tizimdan chiqildi");
    navigate("/login");
    window.location.reload();
  };



  return (
    <Layout>
      <Content style={{ padding: 10, maxWidth: 1000, margin: "0 auto", width: "375px" }}>
        <Modal
          open={extraModal}
          title="Qo'shimcha xizmat qo'shish"
          onCancel={() => setExtraModal(false)}
          footer={null}
        >
          <Form
            form={extraForm}
            layout="vertical"
            onFinish={(values) => {
              setExtraServices([...extraServices, values]);
              setExtraModal(false);
              extraForm.resetFields();
            }}
          >
            <Form.Item
              name="service_name"
              label="Xizmat nomi"
              rules={[{ required: true, message: "Xizmat nomi majburiy" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="service_amount"
              label="Xizmat summasi (so'm)"
              rules={[
                { required: true, message: "Summani kiriting" },
                { type: "number", min: 1, message: "1 dan katta summa kiriting" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary" block>
                Qo'shish
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3}>
              <ShoppingCartOutlined /> KASSA
            </Title>
          </Col>
          <Col>
            <Button
              type="default"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              style={{ marginBottom: 16 }}
            >
              Chiqish
            </Button>
          </Col>
        </Row>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          style={{ maxWidth: 800, margin: "0 auto" }}
        >
          <Form.Item label="Mahsulot qidirish">
            <AutoComplete
              options={productData?.data?.map((p) => ({ value: p.name })) || []}
              value={searchValue}
              onChange={handleProductSearch}
              onSelect={(value) => {
                const found = productData?.data?.find(
                  (p) => p.name === value
                );
                setSelectedProduct(found || null);
                if (found) {
                  form.setFieldsValue({
                    price: found.selling_price,
                    width: null,
                    height: null,
                  });
                  setEnteredPrice(found.selling_price);
                  setEnteredWidth(null);
                  setEnteredHeight(null);
                }
              }}
              style={{ width: "100%" }}
              placeholder="Nomini kiriting"
              allowClear
              filterOption={(inputValue, option) =>
                option.value.toLowerCase().includes(inputValue.toLowerCase())
              }
            />
          </Form.Item>
          <Switch onChange={() => { setEnteredQuantity(null); setIsQuantity(!isQuantity); setEnteredHeight(null); setEnteredWidth(null) }} value={isQuantity} checkedChildren="Soni" unCheckedChildren="Kvadrat" style={{ marginBottom: 16 }} />
          {
            !isQuantity ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="width"
                    label="Eni (m)"
                    rules={[
                      { required: true, message: "Eni kiritilishi shart" },
                      {
                        type: "number",
                        min: 0.01,
                        message: "Eni 0.01 dan katta bo'lishi kerak",
                      },
                    ]}
                  >
                    <InputNumber onChange={(value) => setEnteredWidth(value)} min={0.01} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="height"
                    label="Bo'yi (m)"
                    rules={[
                      { required: true, message: "Bo'yi kiritilishi shart" },
                      {
                        type: "number",
                        min: 0.01,
                        message: "Bo'yi 0.01 dan katta bo'lishi kerak",
                      },
                    ]}
                  >
                    <InputNumber onChange={(value) => setEnteredHeight(value)} min={0.01} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            ) : (
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="quantity"
                    label="Soni"
                    rules={[
                      { required: true, message: "Soni kiritilishi shart" },
                      {
                        type: "number",
                        min: 1,
                        message: "Soni 1 dan katta bo'lishi kerak",
                      },
                    ]}
                  >
                    <InputNumber onChange={(value) => setEnteredQuantity(value)} min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            )
          }
          <Form.Item
            name="price"
            label="Sotish narxi"
            rules={[
              { required: true, message: "Narx kiritilishi shart" },
              {
                type: "number",
                min: 1,
                message: "Narx 1 dan katta bo'lishi kerak",
              },
            ]}
          >
            <InputNumber onChange={(value) => setEnteredPrice(value)} style={{ width: "100%" }} min={1} />
          </Form.Item>
          <Form.Item label="To'lov turi">
            <Select
              defaultValue="naxt"
              onChange={setPaymentType}
              style={{ width: "100%" }}
            >
              <Option value="naxt">Naxt</Option>
              <Option value="karta">Karta</Option>
              <Option value="qarz">Qarz</Option>
            </Select>
          </Form.Item>

          {extraServices.length > 0 && (
            <Card size="small" title={"Qo'shilgan xizmatlar"} style={{ marginBottom: 16 }}>
              {extraServices.map((item, idx) => (
                <Row key={idx} justify="space-between">
                  <Col><Text>{item.service_name}</Text></Col>
                  <Col><Text strong>{item.service_amount} so'm</Text></Col>
                </Row>
              ))}
              <Divider />
              <Row justify="space-between">
                <Col><Text strong>Jami:</Text></Col>
                <Col>
                  <Text strong>
                    {extraServices.reduce((sum, item) => sum + item.service_amount, 0)} so'm
                  </Text>
                </Col>
              </Row>
            </Card>
          )}


          <Form.Item label="Qo'shimcha xizmatlar">
            <Button icon={<PlusOutlined />} onClick={() => setExtraModal(true)} block>
              Qo'shimcha xizmat qo'shish
            </Button>
          </Form.Item>



          <Form.Item label="Mijoz tanlash yoki qo'shish">
            <Row gutter={8}>
              <Col span={20}>
                <AutoComplete
                  value={clientSearch}
                  onChange={handleClientSearch}
                  options={
                    clientData?.clients?.map((c) => ({
                      value: `${c.name} - ${c.phone}`,
                    })) || []
                  }
                  style={{ width: "100%" }}
                  placeholder="Mijoz nomi yoki tel raqam"
                  allowClear
                />
              </Col>
              <Col span={4}>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => setClientModal(true)}
                  block
                />
              </Col>
            </Row>
          </Form.Item>

          {/* {isQuantity
            ? (enteredQuantity && selectedProduct && enteredPrice)
            : (enteredHeight && enteredWidth && enteredPrice && selectedProduct)
              ? (
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Statistic
                    title="Umumiy summa"
                    value={
                      isQuantity
                        ? (selectedProduct?.width || 0) * (selectedProduct?.height || 0) * (enteredQuantity || 0) * (enteredPrice || 0)
                        : (enteredHeight || 0) * (enteredWidth || 0) * (enteredPrice || 0)
                    }

                    suffix={selectedProduct?.currency || "USD"}
                  />
                </Card>
              ) : null} */}
          {(
            (isQuantity &&
              enteredQuantity &&
              selectedProduct &&
              enteredPrice) ||
            (!isQuantity &&
              enteredHeight &&
              enteredWidth &&
              enteredPrice &&
              selectedProduct)
          ) && (
              <Card size="small" style={{ marginBottom: 16 }}>
                <Statistic
                  title="Umumiy summa"
                  value={
                    isQuantity
                      ? (selectedProduct?.width || 0) *
                      (selectedProduct?.height || 0) *
                      (enteredQuantity || 0) *
                      (enteredPrice || 0)
                      : (enteredHeight || 0) *
                      (enteredWidth || 0) *
                      (enteredPrice || 0)
                  }
                  suffix={selectedProduct?.currency || "USD"}
                />
              </Card>
            )}



          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Sotuvni amalga oshirish
            </Button>
          </Form.Item>
        </Form>

        <Modal
          open={clientModal}
          title="Yangi mijoz"
          onCancel={() => setClientModal(false)}
          footer={null}
        >
          <Form
            form={clientForm}
            layout="vertical"
            onFinish={handleCreateClient}
          >
            <Form.Item
              name="name"
              label="Ism"
              rules={[{ required: true, message: "Ism kiritilishi shart" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Telefon"
              rules={[{ required: true, message: "Telefon kiritilishi shart" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="address" label="Manzil">
              <Input />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary" block>
                Saqlash
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
}
