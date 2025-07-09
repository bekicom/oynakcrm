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
        second_price: found.selling_price, // ✅ 2-qavat narxini inputga set qiladi
      });
    }
  };

  useEffect(() => {
    if (!hasSecondProduct) {
      setSecondSelectedProduct(null);
      setSecondProductSearch("");
      form.setFieldsValue({ attach_price: null });
    } else {
      setIsQuantity(false);
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
      if (isBasket) {
        if (basket.length === 0) {
          return message.warning("Savat bo‘sh");
        }

        for (let index = 0; index < basket.length; index++) {
          const item = basket[index];
          const width = item.width || 0;
          const height = item.height || 0;
          const quantity = item.quantity || 1;
          const kv = item.quantity
            ? (item.unit_area || width * height) * quantity
            : width * height;

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
            quantity: item.quantity || null,
            client_id: selectedClient?._id,
            profit: profit < 0 ? 0 : profit,
            extra_services: index === 0 ? [...extraServices] : [],
          };

          await createSale(body).unwrap();
        }

        message.success("Savatchadagi mahsulotlar sotildi");
        setBasket([]);
      } else {
        if (!selectedProduct) return message.warning("Mahsulot tanlanmagan");

        const width = parseFloat(values.width || selectedProduct.width || 0);
        const height = parseFloat(values.height || selectedProduct.height || 0);
        const quantity = parseFloat(values.quantity || 1);
        const kv = isQuantity
          ? selectedProduct.width * selectedProduct.height * quantity
          : width * height;

        const price = parseFloat(values.price || 0);
        const purchase_price = selectedProduct?.purchasePrice?.value || 0;
        const profit = (price - purchase_price) * kv;

        let extra = [...extraServices];
        if (hasSecondProduct && values.attach_price) {
          const glueAmount = kv * values.attach_price;
          extra.push({
            service_name: "Yopishtirish xizmati",
            service_amount: glueAmount,
            currency:"UZS"
          });
        }

        const firstBody = {
          product_id: selectedProduct._id,
          price,
          kv,
          type: paymentType,
          width,
          height,
          client_id: selectedClient?._id,
          profit: profit < 0 ? 0 : profit,
          extra_services: extra,
        };

        await createSale(firstBody).unwrap();

        if (hasSecondProduct && secondSelectedProduct) {
          const secondPrice = parseFloat(
            form.getFieldValue("second_price") ||
              secondSelectedProduct.selling_price
          );

          const secondBody = {
            product_id: secondSelectedProduct._id,
            price: secondPrice,
            kv,
            type: paymentType,
            width,
            height,
            client_id: selectedClient?._id,
            profit:
              (secondPrice -
                (secondSelectedProduct?.purchasePrice?.value || 0)) *
              kv,
            extra_services: [],
          };
          await createSale(secondBody).unwrap();
        }

        message.success("Sotuv amalga oshirildi");
      }

      // form.resetFields();
      // setExtraServices([]);
      // setSelectedClient(null);
      // setSelectedProduct(null);
      // setSecondSelectedProduct(null);
      // setHasSecondProduct(false);
      // setSearchValue("");
      // setSecondProductSearch("");
      // setClientSearch("");
      // setAttachPrice(null);
      // setEnteredWidth(null);
      // setEnteredHeight(null);
      // setEnteredQuantity(null);
      // setEnteredPrice(null);
      // setEditingIndex(null);
      // handleFinish() ichida sotuv tugagach, printga tayyorlab:
      const printItems = isBasket
        ? basket
        : hasSecondProduct
        ? [
            {
              ...selectedProduct,
              width: parseFloat(
                form.getFieldValue("width") || selectedProduct.width || 0
              ),
              height: parseFloat(
                form.getFieldValue("height") || selectedProduct.height || 0
              ),
              selling_price: parseFloat(
                form.getFieldValue("price") ||
                  selectedProduct.selling_price ||
                  0
              ),
              quantity: isQuantity
                ? parseFloat(form.getFieldValue("quantity"))
                : null,
            },
            {
              ...secondSelectedProduct,
              width: parseFloat(
                form.getFieldValue("width") || secondSelectedProduct?.width || 0
              ),
              height: parseFloat(
                form.getFieldValue("height") ||
                  secondSelectedProduct?.height ||
                  0
              ),
              selling_price: secondSelectedProduct?.selling_price || 0,
              quantity: null,
            },
          ]
        : selectedProduct
        ? [
            {
              ...selectedProduct,
              width: parseFloat(
                form.getFieldValue("width") || selectedProduct.width || 0
              ),
              height: parseFloat(
                form.getFieldValue("height") || selectedProduct.height || 0
              ),
              selling_price: parseFloat(
                form.getFieldValue("price") ||
                  selectedProduct.selling_price ||
                  0
              ),
              quantity: isQuantity
                ? parseFloat(form.getFieldValue("quantity"))
                : null,
            },
          ]
        : [];
      setPrintItems(printItems);
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
            <Form.Item>
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
            </Form.Item>
            <Form.Item>
              <Switch
                disabled={isBasket}
                checkedChildren="2 qavat"
                unCheckedChildren="1 qavat  "
                checked={hasSecondProduct}
                onChange={setHasSecondProduct}
              />
            </Form.Item>

            <Switch
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
            />
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
                      second_price: found.selling_price, // ✅ 2-qavat narxini inputga set qiladi
                    });
                  }
                }}
                style={{ width: "100%" }}
                placeholder="2-mahsulot nomi"
                allowClear
              />
            </Form.Item>
          )}
          {!isQuantity ? (
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
            </Row>
          ) : (
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="quantity"
                  label="Soni"
                  rules={
                    basket.length > 0
                      ? []
                      : [
                          { required: true, message: "Soni kiritilishi shart" },
                          {
                            type: "number",
                            min: 1,
                            message: "Soni 1 dan katta bo'lishi kerak",
                          },
                        ]
                  }
                >
                  <InputNumber
                    onChange={(value) => {
                      setEnteredQuantity(value);
                      if (!hasSecondProduct) {
                        setSelectedProduct((prev) => ({
                          ...prev,
                          quantity: value,
                        }));
                      }
                    }}
                    min={1}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
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
                  onChange={(value) => {
                    // optional: setSecondPrice(value)
                  }}
                  style={{ width: "100%" }}
                  min={1}
                />
              </Form.Item>
            </>
          )}

          {isBasket && (
            <Form.Item>
              <Button
                type="dashed"
                block
                disabled={
                  !selectedProduct ||
                  !enteredPrice ||
                  (!isQuantity
                    ? !enteredWidth || !enteredHeight
                    : !enteredQuantity)
                }
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
                  setSelectedProduct(null);
                  setSearchValue("");
                  setEnteredWidth(null);
                  setEnteredHeight(null);
                  setEnteredQuantity(null);
                  setEnteredPrice(null);
                  form.resetFields(["width", "height", "quantity", "price"]);
                }}
              >
                {editingIndex !== null ? "Saqlash" : "Qo'shish"}
              </Button>
            </Form.Item>
          )}
          {isBasket && basket.length > 0 && (
            <Card title="Tanlangan mahsulotlar" size="small">
              {basket.map((item, index) => (
                <>
                  <Row
                    key={index}
                    style={{
                      marginBottom: 8,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Col>
                      <Text>{item.name}</Text>
                      <br />
                      <Text type="secondary">
                        {item.quantity
                          ? `Soni: ${item.quantity}`
                          : `O'lcham: ${item.width}m x ${item.height}m`}
                        , Narxi(1m³): {item.selling_price} {item.currency}
                      </Text>
                    </Col>
                    <Col>
                      <Space>
                        <Button
                          size="small"
                          type="primary"
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
                        >
                          Tahrirlash
                        </Button>
                        <Button
                          size="small"
                          danger
                          onClick={() => {
                            const newBasket = [...basket];
                            newBasket.splice(index, 1);
                            setBasket(newBasket);
                          }}
                        >
                          O‘chirish
                        </Button>
                      </Space>
                    </Col>
                  </Row>
                  <Divider />
                </>
              ))}
            </Card>
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
          {((isQuantity &&
            enteredQuantity &&
            selectedProduct &&
            enteredPrice) ||
            (!isQuantity &&
              enteredHeight &&
              enteredWidth &&
              enteredPrice &&
              selectedProduct) ||
            basket.length > 0) && (
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

                        if (quantity != null) {
                          const unit_area =
                            item?.unit_area ||
                            (item?.width || 0) * (item?.height || 0);
                          return acc + quantity * unit_area * price;
                        } else {
                          return acc + width * height * price;
                        }
                      }, 0)
                    : hasSecondProduct
                    ? [selectedProduct, secondSelectedProduct].reduce(
                        (acc, product) => {
                          if (!product || product?.currency !== "USD")
                            return acc;
                          const width = product?.width || 0;
                          const height = product?.height || 0;
                          const price = product?.selling_price || 0;
                          return acc + width * height * price;
                        },
                        0
                      )
                    : selectedProduct?.currency === "USD"
                    ? isQuantity
                      ? (selectedProduct?.unit_area || 0) *
                        ((selectedProduct?.quantity || 1) *
                          (selectedProduct?.selling_price || 0))
                      : selectedProduct?.width *
                        selectedProduct?.height *
                        selectedProduct?.selling_price
                    : 0
                }
                suffix="USD"
              />
            </Card>
          )}
          {((isQuantity &&
            enteredQuantity &&
            selectedProduct &&
            enteredPrice) ||
            (!isQuantity &&
              enteredHeight &&
              enteredWidth &&
              enteredPrice &&
              selectedProduct) ||
            basket.length > 0) && (
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
                        if (quantity != null) {
                          const unit_area =
                            item?.unit_area ||
                            (item?.width || 0) * (item?.height || 0);
                          return acc + quantity * unit_area * price;
                        } else {
                          return acc + width * height * price;
                        }
                      }, 0)
                    : hasSecondProduct
                    ? [selectedProduct, secondSelectedProduct].reduce(
                        (acc, product) => {
                          if (!product || product?.currency !== "SUM")
                            return acc;
                          const width = product?.width || 0;
                          const height = product?.height || 0;
                          const price = product?.selling_price || 0;
                          return acc + width * height * price;
                        },
                        0
                      )
                    : selectedProduct?.currency === "SUM"
                    ? (selectedProduct?.unit_area || 0) *
                      ((selectedProduct?.quantity || 1) *
                        (selectedProduct?.selling_price || 0))
                    : 0
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
