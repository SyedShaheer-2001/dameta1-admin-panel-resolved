'use client';
import React, { useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import { useRouter } from 'next/navigation';
import BASE_URL from '@/utils/api';

const AuthLogin = ({ title, subtitle, subtext }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/admin/login`,
        { email, password },
        { headers: { 'Content-Type': 'application/json'} }
      );

      const data = response.data;

      if (data?.token) {
        // ✅ Store admin info and token
        sessionStorage.setItem(
          'user',
          JSON.stringify({
            token: data.token,
            ...data.admin,
          })
        );

        // Redirect to dashboard
        router.push('/');
      } else {
        setMessage('Invalid email or password.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const user = sessionStorage.getItem('user')

  console.log('user', user)

  return (
    <>
      {title && (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      )}

      {subtext}

      <Stack spacing={2}>
        <Box>
          <CustomFormLabel htmlFor="email">Email</CustomFormLabel>
          <CustomTextField
            id="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Box>

        <Box>
          <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
          <CustomTextField
            id="password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>

        {message && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {message}
          </Typography>
        )}
      </Stack>

      <Box mt={2}>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </Box>
    </>
  );
};

export default AuthLogin;
