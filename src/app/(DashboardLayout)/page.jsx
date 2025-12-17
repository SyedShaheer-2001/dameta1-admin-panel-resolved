"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import { Grid } from "@mui/material";
import PageContainer from "@/app/components/container/PageContainer";
import { Card, CardContent, Typography } from "@mui/material";
import BASE_URL from "@/utils/api";



export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [blogsCount, setBlogsCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
   const storedUser = JSON.parse(sessionStorage.getItem("user"));
  const token = storedUser?.token;
  

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blogs = data.blogs || [];
      setBlogsCount(blogs.length);
    } catch (error) {
      console.error("Failed to load blogs", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const categories = data.categories || [];
      setCategoriesCount(categories.length);
    } catch (error) {
      console.error("Failed to load categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "auto", display: "flex", justifyContent: "flex-start" }}>
      <PageContainer title="Dashboard" description="This is Dashboard">
        <Box mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ p: 3, minHeight: 160, background: "linear-gradient(135deg, #8389fcff 0%, #666df8ff 100%)", color: "white", borderRadius: 4 }} elevation={6}>
                <CardContent sx={{ display: "flex", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ fontSize: "1.3rem", fontWeight: 800 }}>Blogs Posted</Typography>
                    <Typography sx={{ fontSize: "2rem", fontWeight: 900, mt:2, mb:2 }}>
                      {loading ? "Loading..." : blogsCount}
                    </Typography>
                    <Typography sx={{ fontSize: "0.9rem", opacity: 0.8, mt: 0.5 }}>
                      Total number of blogs on your website
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ p: 3, minHeight: 160, background: "linear-gradient(135deg, #ffb86c 0%, #ff6b35 100%)", color: "white", borderRadius: 4 }} elevation={6}>
                <CardContent sx={{ display: "flex", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ fontSize: "1.3rem", fontWeight: 800 }}>Categories</Typography>
                    <Typography sx={{ fontSize: "2rem", fontWeight: 900, mt:2, mb:2 }}>
                      {loading ? "Loading..." : categoriesCount}
                    </Typography>
                    <Typography sx={{ fontSize: "0.9rem", opacity: 0.8, mt: 0.5 }}>
                      Total number of categories on your website
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

          </Grid>
        </Box>
      </PageContainer>
    </div>
  );
}
