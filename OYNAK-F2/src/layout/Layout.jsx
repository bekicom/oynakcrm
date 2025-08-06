import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  TeamOutlined,
  BarChartOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  DollarCircleOutlined, 
} from "@ant-design/icons";


const { Sider, Content, Header } = Layout;

const menuItems = [
  { label: "Dashboard", key: "/", icon: <BarChartOutlined /> },
  { label: "Mahsulotlar", key: "/products", icon: <AppstoreOutlined /> },
  { label: "Klientlar", key: "/all-clients", icon: <TeamOutlined /> },
  { label: "Sotuvlar", key: "/sotuvlar", icon: <BarChartOutlined /> },
  { label: "Xarajatlar", key: "/expenses", icon: <DollarCircleOutlined /> },
];



const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const onMenuClick = ({ key }) => {
    if (key === "logout") {
      localStorage.clear();
      navigate("/login");
      window.location.reload();
    } else {
      navigate(key);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="dark" width={220}>
        <div
          style={{
            height: 64,
            margin: 16,
            color: "#fff",
            fontSize: 18,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          🏢 Oynak CRM
        </div>

        <Menu
          theme="dark"
          mode="inline"
          onClick={onMenuClick}
          selectedKeys={
            menuItems.some((item) => item.key === location.pathname)
              ? [location.pathname]
              : []
          }
          items={[
            ...menuItems,
            { type: "divider" },
            {
              label: "Chiqish",
              key: "logout",
              icon: <LogoutOutlined />,
              danger: true,
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            padding: 0,
            textAlign: "center",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2 style={{ margin: 0 }}>Admin Panel</h2>
        </Header>

        <Content
          style={{
            margin: "16px",
            padding: 16,
            background: "#fff",
            minHeight: "calc(100vh - 112px)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
