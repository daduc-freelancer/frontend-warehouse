import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 240;

const menuItems = [
  { text: "Thiết bị mượn", path: "/thiet-bi-muon" },
  { text: "Thiết bị trả", path: "/thiet-bi-tra" },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const userName = localStorage.getItem("userName");

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setTimeout(() => navigate("/"), 300); // Redirect to login page after 300ms
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Quản lý thiết bị
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
            >
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <CssBaseline />
      {/* Header AppBar */}
      <AppBar
        position="fixed"
        sx={{
          //   width: "100vw",
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Quản lý thiết bị
          </Typography>

          {/* Hiển thị email người dùng và nút Logout */}
          {/* {userEmail && (
            <Typography variant="body1" sx={{ mr: 2 }}>
              {userEmail}
            </Typography>
          )} */}
          {userName && (
            <Typography variant="body1" sx={{ mr: 2 }}>
              Xin chào, {userName}
            </Typography>
          )}

          <IconButton
            color="inherit"
            onClick={handleLogout}
            aria-label="logout"
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
          height: "100vh", // Ensures sidebar takes full height
        }}
        aria-label="sidebar"
      >
        {/* Sidebar mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Sidebar desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          //   p: 3,
          minWidth: 0,
          height: "100vh", // Ensure main content area takes full screen height
          overflow: "auto", // Allow scrolling if content exceeds the screen height
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
