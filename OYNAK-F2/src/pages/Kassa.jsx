import { useState, useEffect, useRef } from "react";
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
  Space,
  Table,
} from "antd";
import {
  ShoppingCartOutlined,
  PlusOutlined,
  LogoutOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useGetAllProductsQuery } from "../features/api/products.api";
import {
  useGetClientsQuery,
  useCreateClientMutation,
} from "../features/api/client.service";
import { useCreateSaleMutation } from "../features/api/sales.api";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import PrintableReceipt from "../components/PrintableReceipt";

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

  const [editingIndex, setEditingIndex] = useState(null);

  const { data: productData } = useGetAllProductsQuery();
  const { data: clientData, refetch } = useGetClientsQuery();
  const [createClient] = useCreateClientMutation();
  const [createSale] = useCreateSaleMutation();
  const navigate = useNavigate();
  const [hasSecondProduct, setHasSecondProduct] = useState(false);
  const [secondSelectedProduct, setSecondSelectedProduct] = useState(null);
  const [secondProductSearch, setSecondProductSearch] = useState("");
  const [basket, setBasket] = useState([]);
  const [attachPrice, setAttachPrice] = useState(null);
  const [isBasket, setIsBasket] = useState(false);
  const [printItems, setPrintItems] = useState([]);

  const printRef = useRef(null);

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open("", "", "height=800,width=800");
    printWindow.document.write("<html><head><title>Print</title></head><body>");
    printWindow.document.write(printContents);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleProductSearch = (value) => {
    setSearchValue(value);
    const found = productData?.data?.find((p) =>
      p.name.toLowerCase().includes(value.toLowerCase())
    );
    setSelectedProduct(found || null);
    if (found) form.setFieldsValue({ price: found.sell_price });
  };
  const handleSecondProductSearch = (value) => {
    setSecondProductSearch(value);
    const found = productData?.data?.find((p) =>
      p.name.toLowerCase().includes(value.toLowerCase())
    );
    setSecondSelectedProduct(found || null);
    if (found) {
      form.setFieldsValue({
        second_price: found.selling_price,
      });
    }
  };

  useEffect(() => {
    if (!hasSecondProduct) {
      setSecondSelectedProduct(null);
      setSecondProductSearch("");
      form.setFieldsValue({ attach_price: null });
    } else {
      setEnteredQuantity(null);
    }
  }, [hasSecondProduct]);

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
    if (paymentType === "qarz" && !selectedClient) {
      return message.warning("Qarzga sotish uchun mijoz tanlanishi shart");
    }

    try {
      if (hasSecondProduct && selectedProduct && secondSelectedProduct) {
        const width1 = parseFloat(values.width || selectedProduct.width || 0);
        const height1 = parseFloat(
          values.height || selectedProduct.height || 0
        );
        const quantity1 = parseFloat(values.quantity || 1);
        const kv1 = width1 * height1 * quantity1;
        const price1 = parseFloat(
          values.price || selectedProduct.selling_price || 0
        );
        const profit1 =
          (price1 - (selectedProduct?.purchasePrice?.value || 0)) * kv1;

        const width2 = parseFloat(
          values.width || secondSelectedProduct.width || 0
        );
        const height2 = parseFloat(
          values.height || secondSelectedProduct.height || 0
        );
        const quantity2 = 1;
        const kv2 = width2 * height2 * quantity2;
        const price2 = parseFloat(
          values.second_price || secondSelectedProduct.selling_price || 0
        );
        const profit2 =
          (price2 - (secondSelectedProduct?.purchasePrice?.value || 0)) * kv2;

        let extra = [...extraServices];
        if (values.attach_price) {
          extra.push({
            service_name: "Yopishtirish xizmati",
            service_amount: kv1 * values.attach_price,
            currency: "UZS",
          });
        }

        await createSale({
          product_id: selectedProduct._id,
          price: price1,
          kv: kv1,
          type: paymentType,
          width: width1,
          height: height1,
          quantity: quantity1,
          client_id: selectedClient?._id,
          profit: profit1 < 0 ? 0 : profit1,
          extra_services: extra,
        }).unwrap();

        await createSale({
          product_id: secondSelectedProduct._id,
          price: price2,
          kv: kv2,
          type: paymentType,
          width: width2,
          height: height2,
          quantity: null,
          client_id: selectedClient?._id,
          profit: profit2 < 0 ? 0 : profit2,
          extra_services: [],
        }).unwrap();

        message.success("Mahsulotlar sotildi");
        setPrintItems([
          {
            ...selectedProduct,
            width: width1,
            height: height1,
            selling_price: price1,
            quantity: quantity1,
          },
          {
            ...secondSelectedProduct,
            width: width2,
            height: height2,
            selling_price: price2,
            quantity: null,
          },
        ]);
      } else {
        if (basket.length === 0) {
          return message.warning("Savat bo'sh");
        }

        const itemsToPrint = [];

        basket.forEach(async (item, index) => {
          const width = item.width || 0;
          const height = item.height || 0;
          const quantity = item.quantity || 1;
          const kv = width * height * quantity;
          const price = item.selling_price || 0;
          const purchase_price = item?.purchasePrice?.value || 0;
          const profit = (price - purchase_price) * kv;

          const body = {
            product_id: item._id,
            price,
            kv,
            type: paymentType,
            width,
            height,
            quantity,
            client_id: selectedClient?._id,
            profit: profit < 0 ? 0 : profit,
            extra_services: index === 0 ? [...extraServices] : [],
          };

          await createSale(body).unwrap();

          itemsToPrint.push({
            ...item,
            width,
            height,
            quantity,
            selling_price: price,
          });
        });

        message.success("Savatchadagi mahsulotlar sotildi");
        setBasket([]);
        setPrintItems(itemsToPrint);
      }

      setTimeout(() => {
        handlePrint();
      }, 300);
    } catch (err) {
      message.error("Xatolik: " + (err?.data?.message || "Noma'lum xato"));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    message.success("Tizimdan chiqildi");
    navigate("/login");
    window.location.reload();
  };

  const columns = [
    {
      title: "Tovar",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Eni (m)",
      dataIndex: "width",
      key: "width",
      render: (width) => width ?? "-",
    },
    {
      title: "Bo'yi (m)",
      dataIndex: "height",
      key: "height",
      render: (height) => height ?? "-",
    },
    {
      title: "Soni",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity) => quantity ?? "-",
    },
    {
      title: "m2",
      key: "m2",
      render: (_, item) =>
        item.width && item.height ? (item.width * item.height).toFixed(2) : "-",
    },
    {
      title: "Jami m2",
      key: "total_m2",
      render: (_, item) =>
        item.width && item.height && item.quantity
          ? (item.width * item.height * item.quantity).toFixed(2)
          : "-",
    },
    {
      title: "Amallar",
      key: "actions",
      render: (_, item, index) => (
        <Space direction="vertical">
          <Button
            size="small"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedProduct(item);
              setSearchValue(item.name);
              setEnteredWidth(item.width || null);
              setEnteredHeight(item.height || null);
              setEnteredQuantity(item.quantity || null);
              setEnteredPrice(item.selling_price);
              form.setFieldsValue({
                width: item.width || null,
                height: item.height || null,
                quantity: item.quantity || null,
                price: item.selling_price,
              });
              setEditingIndex(index);
            }}
          ></Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              const newBasket = [...basket];
              newBasket.splice(index, 1);
              setBasket(newBasket);
            }}
          ></Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <PrintableReceipt
            client={selectedClient}
            items={printItems}
            extras={[
              ...extraServices,
              ...(hasSecondProduct && attachPrice
                ? [
                    {
                      service_name: "Yopishtirish xizmati",
                      service_amount:
                        (selectedProduct?.width || 0) *
                          (selectedProduct?.height || 0) *
                          attachPrice || 0,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </div>

      <Content
        style={{
          padding: 10,
          maxWidth: 1000,
          margin: "0 auto",
          width: "375px",
        }}
      >
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
                {
                  type: "number",
                  min: 1,
                  message: "1 dan katta summa kiriting",
                },
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
          <Space
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* <Form.Item>
              <Switch
                checkedChildren="1+"
                unCheckedChildren="Faqat 1 ta"
                checked={isBasket}
                onChange={(value) => {
                  setIsBasket(value);
                  if (value) {
                    setHasSecondProduct(false);
                    setSecondSelectedProduct(null);
                    setSecondProductSearch("");
                  }
                }}
              />
            </Form.Item> */}
            <Form.Item>
              <Switch
                disabled={isBasket}
                checkedChildren="2 qavat"
                unCheckedChildren="1 qavat  "
                checked={hasSecondProduct}
                onChange={setHasSecondProduct}
              />
            </Form.Item>
            {/* <Switch
              onChange={(checked) => {
                setIsQuantity(checked);
                if (checked) {
                  setEnteredWidth(null);
                  setEnteredHeight(null);
                } else {
                  setEnteredQuantity(null);
                }
              }}
              value={isQuantity}
              checkedChildren="Soni"
              disabled={hasSecondProduct}
              unCheckedChildren="Kvadrat"
              style={{ marginBottom: 16 }}
            /> */}
          </Space>
          <Form.Item label="Mahsulot qidirish">
            <AutoComplete
              options={productData?.data?.map((p) => ({ value: p.name })) || []}
              value={searchValue}
              onChange={handleProductSearch}
              onSelect={(value) => {
                const found = productData?.data?.find((p) => p.name === value);
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
          {hasSecondProduct && (
            <Form.Item label="2-mahsulot qidirish">
              <AutoComplete
                options={
                  productData?.data?.map((p) => ({ value: p.name })) || []
                }
                value={secondProductSearch}
                onChange={handleSecondProductSearch}
                onSelect={(value) => {
                  const found = productData?.data?.find(
                    (p) => p.name === value
                  );
                  setSecondSelectedProduct(found || null);
                  if (found) {
                    form.setFieldsValue({
                      second_price: found.selling_price,
                    });
                  }
                }}
                style={{ width: "100%" }}
                placeholder="2-mahsulot nomi"
                allowClear
              />
            </Form.Item>
          )}
          <Row gutter={16}>
            <Col span={8}>
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
                <InputNumber
                  onChange={(value) => {
                    setEnteredWidth(value);
                    if (hasSecondProduct) {
                      setSelectedProduct((prev) => ({
                        ...prev,
                        width: value,
                      }));
                      setSecondSelectedProduct((prev) => ({
                        ...prev,
                        width: value,
                      }));
                    } else {
                      setSelectedProduct((prev) => ({
                        ...prev,
                        width: value,
                      }));
                    }
                  }}
                  min={0.01}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
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
                <InputNumber
                  onChange={(value) => {
                    setEnteredHeight(value);
                    if (hasSecondProduct) {
                      setSelectedProduct((prev) => ({
                        ...prev,
                        height: value,
                      }));
                      setSecondSelectedProduct((prev) => ({
                        ...prev,
                        height: value,
                      }));
                    } else {
                      setSelectedProduct((prev) => ({
                        ...prev,
                        height: value,
                      }));
                    }
                  }}
                  min={0.01}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Soni"
                rules={[
                  { required: true, message: "Soni kiritilishi shart" },
                  {
                    type: "number",
                    min: 0,
                    message: "Soni 0 dan katta bo'lishi kerak",
                  },
                ]}
              >
                <InputNumber
                  onChange={(value) => {
                    setEnteredQuantity(value);
                    setSelectedProduct((prev) => ({
                      ...prev,
                      quantity: value,
                    }));
                    setSecondSelectedProduct((prev) => ({
                      ...prev,
                      quantity: value,
                    }));
                  }}
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          {!hasSecondProduct ? (
            <Form.Item
              name="price"
              label="Sotish narxi"
              rules={
                basket.length > 0
                  ? []
                  : [
                      { required: true, message: "Narx kiritilishi shart" },
                      {
                        type: "number",
                        min: 1,
                        message: "Narx 1 dan katta bo'lishi kerak",
                      },
                    ]
              }
            >
              <InputNumber
                onChange={(value) => setEnteredPrice(value)}
                style={{ width: "100%" }}
                min={1}
              />
            </Form.Item>
          ) : (
            <>
              <Form.Item
                name="price"
                label={`1-qavat narxi (${
                  selectedProduct?.name || "mahsulot"
                }):`}
                rules={[{ required: true, message: "1-qavat narxi majburiy" }]}
              >
                <InputNumber
                  onChange={(value) => setEnteredPrice(value)}
                  style={{ width: "100%" }}
                  min={1}
                />
              </Form.Item>

              <Form.Item
                name="second_price"
                label={`2-qavat narxi (${
                  secondSelectedProduct?.name || "mahsulot"
                }):`}
                rules={[{ required: true, message: "2-qavat narxi majburiy" }]}
              >
                <InputNumber
                  onChange={(value) => {}}
                  style={{ width: "100%" }}
                  min={1}
                />
              </Form.Item>
            </>
          )}

          {/* {isBasket && ( */}
          <Form.Item>
            <Button
              type="dashed"
              block
              disabled={hasSecondProduct}
              icon={<FaPlus />}
              onClick={() => {
                const newItem = {
                  ...selectedProduct,
                  width: enteredWidth,
                  height: enteredHeight,
                  quantity: enteredQuantity,
                  selling_price: enteredPrice,
                };

                const newBasket = [...basket];
                if (editingIndex !== null) {
                  newBasket[editingIndex] = newItem;
                  setEditingIndex(null);
                } else {
                  newBasket.push(newItem);
                }

                setBasket(newBasket);
              }}
            >
              {editingIndex !== null ? "Saqlash" : "Qo'shish"}
            </Button>
          </Form.Item>
          {/* )} */}
          {basket.length > 0 && (
            <Table
              title={() => "Tanlangan mahsulotlar"}
              dataSource={basket.map((item, index) => ({
                ...item,
                key: index,
              }))}
              columns={columns}
              size="small"
              pagination={false}
            />
          )}
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
          {hasSecondProduct && (
            <Form.Item
              label="1m³ uchun yopishtirish narxi"
              name="attach_price"
              rules={[
                { required: true, message: "Narx kiritilishi shart" },
                {
                  type: "number",
                  min: 1,
                  message: "1 dan katta qiymat kiriting",
                },
              ]}
            >
              <InputNumber
                onChange={setAttachPrice}
                style={{ width: "100%" }}
                min={1}
              />
            </Form.Item>
          )}
          {(extraServices.length > 0 || (hasSecondProduct && attachPrice)) && (
            <Card
              size="small"
              title={"Qo'shilgan xizmatlar"}
              style={{ marginBottom: 16 }}
            >
              {hasSecondProduct && attachPrice && (
                <Row justify="space-between" style={{ marginBottom: 8 }}>
                  <Col>
                    <Text>Yopishtirish xizmati:</Text>
                  </Col>
                  <Col>
                    <Text strong>
                      {(
                        (selectedProduct.width || 0) *
                        (selectedProduct.height || 0) *
                        attachPrice
                      ).toFixed(2)}{" "}
                      so'm
                    </Text>
                  </Col>
                </Row>
              )}
              {extraServices.map((item, idx) => (
                <Row key={idx} justify="space-between">
                  <Col>
                    <Text>{item.service_name}</Text>
                  </Col>
                  <Col>
                    <Text strong>{item.service_amount} so'm</Text>
                  </Col>
                </Row>
              ))}
              <Divider />
              <Row justify="space-between">
                <Col>
                  <Text strong>Jami:</Text>
                </Col>
                <Col>
                  <Text strong>
                    {(
                      extraServices.reduce(
                        (sum, item) => sum + item.service_amount,
                        0
                      ) +
                      (!isBasket
                        ? (selectedProduct.width || 0) *
                          (selectedProduct.height || 0) *
                          attachPrice
                        : 0)
                    ).toLocaleString()}{" "}
                    so'm
                  </Text>
                </Col>
              </Row>
            </Card>
          )}
          <Form.Item label="Qo'shimcha xizmatlar">
            <Button
              icon={<PlusOutlined />}
              onClick={() => setExtraModal(true)}
              block
            >
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
          {(basket.length > 0 || hasSecondProduct) && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <Statistic
                title="Umumiy tovar summasi"
                value={
                  basket.length > 0
                    ? basket.reduce((acc, item) => {
                        if (item?.currency !== "USD") return acc;

                        const width = item?.width || 0;
                        const height = item?.height || 0;
                        const price = item?.selling_price || 0;
                        const quantity = item?.quantity;

                        return acc + width * height * quantity * price;
                      }, 0)
                    : (() => {
                        const products = hasSecondProduct
                          ? [selectedProduct, secondSelectedProduct]
                          : [selectedProduct];

                        return products.reduce((acc, product) => {
                          if (!product || product?.currency !== "USD")
                            return acc;

                          const width = product?.width || 0;
                          const height = product?.height || 0;
                          const price = product?.selling_price || 0;
                          const quantity = product?.quantity;

                          Number(
                            acc + width * height * quantity * price
                          ).toFixed(2);
                        }, 0);
                      })()
                }
                suffix="USD"
              />
            </Card>
          )}
          {(basket.length > 0 || hasSecondProduct) && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <Statistic
                title="Umumiy tovar summasi"
                value={
                  basket.length > 0
                    ? basket.reduce((acc, item) => {
                        if (item?.currency !== "SUM") return acc;

                        const width = item?.width || 0;
                        const height = item?.height || 0;
                        const price = item?.selling_price || 0;
                        const quantity = item?.quantity;

                        return acc + width * height * quantity * price;
                      }, 0)
                    : (() => {
                        const products = [
                          selectedProduct,
                          secondSelectedProduct,
                        ];
                        return products.reduce((acc, product) => {
                          if (!product || product?.currency !== "SUM")
                            return acc;

                          const width = product?.width || 0;
                          const height = product?.height || 0;
                          const price = product?.selling_price || 0;
                          const quantity = product?.quantity;

                          Number(
                            acc + width * height * quantity * price
                          ).toFixed(2);
                        }, 0);
                      })()
                }
                suffix="UZS"
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
