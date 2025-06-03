import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Popconfirm,
  message,
} from "antd";
import dayjs from "dayjs";
import {
  useGetAllExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from "../features/api/expense.api";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const Expenses = () => {
  const { data, isLoading, refetch } = useGetAllExpensesQuery();
  const [createExpense] = useCreateExpenseMutation();
  const [updateExpense] = useUpdateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();

  // ✅ Fallback: har doim massiv bo‘lishi uchun
  const expenses = Array.isArray(data?.message) ? data.message : [];

  const openModal = (record = null) => {
    setEditData(record);
    setIsModalOpen(true);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
  };

  const handleFinish = async (values) => {
    try {
      if (editData) {
        await updateExpense({ id: editData._id, ...values }).unwrap();
        message.success("Xarajat yangilandi");
      } else {
        await createExpense(values).unwrap();
        message.success("Xarajat qo‘shildi");
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      message.error("Xatolik: " + (err?.data?.message || "serverda xatolik"));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id).unwrap();
      message.success("Xarajat o‘chirildi");
      refetch();
    } catch {
      message.error("O‘chirishda xatolik");
    }
  };

  const columns = [
    {
      title: "Sana",
      dataIndex: "createdAt",
      render: (val) => dayjs(val).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Xarajat summasi",
      dataIndex: "amount",
      render: (val) => val.toLocaleString("uz-UZ") + " so'm",
    },
    {
      title: "Sababi",
      dataIndex: "reason",
    },
    {
      title: "Amallar",
      render: (_, record) => (
        <Space>
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
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => openModal()}
        style={{ marginBottom: 16 }}
      >
        Yangi xarajat
      </Button>

      <Table
        columns={columns}
        dataSource={expenses} // ✅ endi to‘g‘ri array
        rowKey="_id"
        loading={isLoading}
        bordered
      />

      <Modal
        open={isModalOpen}
        title={editData ? "Xarajatni tahrirlash" : "Yangi xarajat qo‘shish"}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText={editData ? "Saqlash" : "Qo‘shish"}
        cancelText="Bekor qilish"
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="amount"
            label="Xarajat summasi"
            rules={[{ required: true, message: "Summani kiriting" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Sababi"
            rules={[{ required: true, message: "Xarajat sababini kiriting" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Expenses;
