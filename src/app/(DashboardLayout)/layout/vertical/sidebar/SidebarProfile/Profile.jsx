'use client';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useContext, useState } from 'react';
import { CustomizerContext } from "@/app/context/customizerContext";
import { IconPower } from '@tabler/icons-react';
import axios from 'axios';
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/app/store/authSlice";
import { persistor } from "@/app/store/store";
import BASE_URL from '@/utils/api';
import CircularProgress from '@mui/material/CircularProgress';

export const Profile = () => {
  const { isSidebarHover, isCollapse } = useContext(CustomizerContext);
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? isCollapse === 'mini-sidebar' && !isSidebarHover : '';

  const [loading, setLoading] = useState(false);

    const storedUser = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
    const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(sessionStorage.getItem("user"));
      const token = storedUser?.token;

      if (!token) {
        console.warn("No token found, logging out locally.");
      } else {
        // ✅ Call logout API
        await axios.post(
          `${BASE_URL}/admin/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      sessionStorage.removeItem("user");

      // Wait a tiny bit so UI shows spinner before redirect
      setTimeout(() => {
        window.location.href = "/auth/auth1/login";
      }, 300);
    }
  };

  return (
    <Box
      display={'flex'}
      alignItems="center"
      gap={2}
      sx={{ m: 3, p: 2, bgcolor: `secondary.light` }}
    >
      {!hideMenu ? (
        <>

          <Box>
            <Typography variant="h6">{user?.data?.name || "Super Admin"}</Typography>
            <Typography variant="caption">{user?.data?.userType || "Administrator"}</Typography>
          </Box>

          <Box sx={{ ml: 'auto' }}>
            <Tooltip title="Logout" placement="top">
              <IconButton
                color="primary"
                aria-label="logout"
                size="small"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <IconPower size="20" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </>
      ) : null}
    </Box>
  );
};
