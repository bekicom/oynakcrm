import React, { useEffect, useState } from "react";
import { Form, Input, Button, Typography, message, Card } from "antd";
import { LockOutlined, UserOutlined, LoginOutlined } from "@ant-design/icons";
import { useLoginMutation } from "../features/api/auth.service";
import { useNavigate } from "react-router-dom";
import "../index.css"; // 👉 animatsiyalar va stil uchun

const { Title } = Typography;

const Login = () => {
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  const onFinish = async (values) => {
    try {
      const res = await login(values).unwrap();

      const role = res.user.role;

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", role);

      message.success("Xush kelibsiz!");

      if (role === "user") {
        navigate("/kassa");
        window.location.reload();
      } else {
        navigate("/dashboard");
        window.location.reload();
      }
    } catch (err) {
      message.error(err?.data?.message || "Login xatoligi");
    }
  };


  return (
    <div className="login-page">
      <div className={`login-card ${animate ? "fade-in-up" : ""}`}>
        <Card bordered={false} style={{ background: "transparent" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <LoginOutlined style={{ fontSize: 38, color: "#1890ff" }} />
            <Title level={3} style={{ marginTop: 10, color: "#fff" }}>
              Admin Panelga Kirish
            </Title>
          </div>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="phone"
              label={<span style={{ color: "#fff" }}>Telefon raqam</span>}
              rules={[{ required: true, message: "Telefon raqam kiriting!" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="998901234567"
                className="transparent-input"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label={<span style={{ color: "#fff" }}>Parol</span>}
              rules={[{ required: true, message: "Parol kiriting!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="••••••••"
                className="transparent-input"
              />
            </Form.Item>
            <Form.Item>
              <Button
                block
                type="primary"
                htmlType="submit"
                loading={isLoading}
                icon={<LoginOutlined />}
              >
                Kirish
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
