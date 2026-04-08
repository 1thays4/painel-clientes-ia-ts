import React, { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Message,
  Settings,
  Logout,
  AccountCircle,
} from "@mui/icons-material";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";

interface MuiLayoutProps {
  children: React.ReactNode;
  title: string;
}

const drawerWidth = 240;

const MuiLayout: React.FC<MuiLayoutProps> = ({ children, title }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const { signOut, user } = useAuth();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await signOut();
    sessionStorage.removeItem("lastRedirect");
    router.push("/login");
  };

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/painel" },
    {
      text: "Atendimento Humano",
      icon: <People />,
      path: "/atendimento-humano",
    },
    { text: "Diagnóstico", icon: <Message />, path: "/diagnostico" },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ fontWeight: "bold" }}
        >
          Painel de Clientes
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            button={true as any}
            onClick={() => router.push(item.path)}
            sx={{
              "&:hover": {
                backgroundColor: theme.palette.primary.light + "14", // 14 = 8% de opacidade em hex
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: theme.shadows[2],
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Tooltip title="Configurações da conta">
            <IconButton
              onClick={handleProfileMenuOpen}
              size="large"
              edge="end"
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>Perfil</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Configurações</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Sair</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={drawerOpen}
        onClose={isMobile ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { sm: drawerOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar /> {/* Espaçamento para a AppBar */}
        <Container maxWidth="xl" sx={{ mt: 2 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default MuiLayout;
