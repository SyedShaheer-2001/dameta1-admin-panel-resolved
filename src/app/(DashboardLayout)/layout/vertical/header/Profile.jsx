'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import * as dropdownData from './data';

import { IconMail } from '@tabler/icons-react';
import { Stack } from '@mui/system';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/app/store/authSlice"; 
import { persistor } from "@/app/store/store";
import BASE_URL from '@/utils/api';

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

    const storedUser = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
    const user = storedUser ? JSON.parse(storedUser) : null;

  const token = user?.token; // depends on your authSlice

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => setAnchorEl2(null);

  const handleUploadClick = () => setDialogOpen(true);
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedImage(null);
  };

  const handleFileChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedImage || !token) return;

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      setUploading(true);
      const res = await axios.post(
        `${BASE_URL}/admin/auth/editImage`,
        formData,
        {
          headers: {
            'x-access-token': token,
            'Content-Type': 'multipart/form-data',
          },
        }
      );


      handleDialogClose();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

const handleLogout = async () => {
  try {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const token = storedUser?.token;

    if (!token) {
      console.warn("No token found, logging out locally.");
      dispatch(logout());
      persistor.purge();
      sessionStorage.removeItem("user");
      window.location.href = "/auth/auth1/login";
      return;
    }

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

    sessionStorage.removeItem("user");
    window.location.href = "/auth/auth1/login";
  } catch (error) {
    console.error("Logout error:", error);
    sessionStorage.removeItem("user");
    window.location.href = "/auth/auth1/login";
  }
};

  return (
    <Box>
      <IconButton
        size="large"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        onClick={handleClick2}
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
      >
        <Avatar
          src={user?.image || '/images/profile/user-1.jpg'}
          alt="ProfileImg"
          sx={{ width: 35, height: 35 }}
        />
      </IconButton>

      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '360px',
            p: 4,
          },
        }}
      >
        <Typography variant="h5">User Profile</Typography>
        <Stack direction="row" py={3} spacing={2} alignItems="center">
          {/* <Avatar
            src={user?.image || '/images/profile/user-1.jpg'}
            alt="ProfileImg"
            sx={{ width: 95, height: 95 }}
          /> */}
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.name || "Joe Wilson"}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              {user?.role}
            </Typography>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              display="flex"
              alignItems="center"
              gap={1}
            >
              <IconMail width={15} height={15} />
              {user?.email}
            </Typography>
          </Box>
        </Stack>
        <Divider />
        {/* {dropdownData.profile.map((profile) => (
          <Box key={profile.title}>
            <Box sx={{ py: 2, px: 0 }} className="hover-text-primary">
              <Link href={profile.href}>
                <Stack direction="row" spacing={2}>
                  <Box
                    width="45px"
                    height="45px"
                    bgcolor="primary.light"
                    display="flex"
                    alignItems="center"
                    justifyContent="center" flexShrink="0"
                  >
                    <Avatar
                      src={profile.icon}
                      alt={profile.icon}
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 0,
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      color="textPrimary"
                      className="text-hover"
                      noWrap
                      sx={{
                        width: '240px',
                      }}
                    >
                      {profile.title}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="subtitle2"
                      sx={{
                        width: '240px',
                      }}
                      noWrap
                    >
                      {profile.subtitle}
                    </Typography>
                  </Box>
                </Stack>
              </Link>
            </Box>
          </Box>
        ))} */}
        <Box mt={2}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Menu>

      {/* Upload Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Upload Profile Image</DialogTitle>
        <DialogContent>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading || !selectedImage}>
            {uploading ? <CircularProgress size={20} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
