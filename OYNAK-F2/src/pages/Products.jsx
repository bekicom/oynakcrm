import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Popconfirm,
  Typography,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

import {
  useGetAllProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../features/api/products.api";

const { Title } = Typography;
const { Option } = Select;

const Products = () => {
  const { data, isLoading, refetch } = useGetAllProductsQuery();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();

  const products = Array.isArray(data?.data)
    ? data?.data
    : Array.isArray(data?.products)
      ? data.products
      : [];

  const openModal = (record = null) => {
    setEditData(record);
    setIsModalOpen(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  const handleFinish = async (values) => {
    try {
      if (editData) {
        await updateProduct({ id: editData._id, ...values }).unwrap();
        message.success("Mahsulot yangilandi");
      } else {
        await createProduct(values).unwrap();
        message.success("Mahsulot qo‘shildi");
      }
      refetch();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Xatolik:", err);
      message.error("Xatolik yuz berdi");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id).unwrap();
      message.success("Mahsulot o‘chirildi");
      refetch();
    } catch {
      message.error("O‘chirishda xatolik");
    }
  };

  const columns = [
    {
      title: "Mahsulot",
      dataIndex: "name",
      align: "center",
      render: (text) => (
        <span style={{ color: "#1890ff", fontWeight: 600 }}>{text}</span>
      ),
    },
    { title: "Eni (m)", dataIndex: "width", align: "center" },
    { title: "Bo‘yi (m)", dataIndex: "height", align: "center" },
    { title: "Jami kv.m", dataIndex: "area", align: "center" },
    { title: "Miqdor", render: (_, record) => (record.area / (record.width * record.height)), align: "center" },
    { title: "1 donasi kv.m", dataIndex: "unit_area", align: "center" },
    { title: "Kelish narxi", dataIndex: "purchase_price", align: "center" },
    { title: "Sotish narxi", dataIndex: "selling_price", align: "center" },
    {
      title: "Valyuta",
      dataIndex: "currency",
      align: "center",
      render: (val) => (val === "USD" ? "$" : "so‘m"),
    },
    { title: "Kimdan", dataIndex: "from", align: "center" },
    {
      title: "Amallar",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          />
          <Popconfirm
            title="O‘chirishni tasdiqlaysizmi?"
            onConfirm={() => handleDelete(record._id)}
            okText="Ha"
            cancelText="Yo‘q"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];


  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "start",
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => openModal()}
        >
          Yangi mahsulot
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="_id"
        loading={isLoading}
        bordered
        pagination={{ pageSize: 8 }}
      />

      <Modal
        open={isModalOpen}
        title={editData ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo‘shish"}
        okText={editData ? "Saqlash" : "Qo‘shish"}
        cancelText="Bekor qilish"
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="name"
            label="Mahsulot nomi"
            rules={[{ required: true, message: "Mahsulot nomini kiriting" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="width"
            label="Eni (metr)"
            rules={[{ required: true, type: "number", min: 0.01 }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="height"
            label="Bo‘yi (metr)"
            rules={[{ required: true, type: "number", min: 0.01 }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Miqdor"
            rules={[{ required: true, type: "number", min: 1 }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="purchase_price"
            label="Kelish narxi"
            rules={[{ required: true, type: "number", min: 0 }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="selling_price"
            label="Sotish narxi"
            rules={[{ required: true, type: "number", min: 0 }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="currency"
            label="Valyuta"
            rules={[{ required: true, message: "Valyutani tanlang" }]}
          >
            <Select placeholder="Valyutani tanlang">
              <Option value="USD">USD</Option>
              <Option value="SUM">SUM</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="from"
            label="Kimdan kelgan"
            rules={[{ required: true, message: "Kimdan kelganini kiriting" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
