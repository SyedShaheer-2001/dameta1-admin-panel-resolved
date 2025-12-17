'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Snackbar,
  Alert,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BASE_URL, { Live_webiste_URL} from '@/utils/api';
import VisibilityIcon from '@mui/icons-material/Visibility';


const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editId, setEditId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const storedUser = JSON.parse(sessionStorage.getItem("user"));
  const token = storedUser?.token;
  
  const [feedback, setFeedback] = useState({
    message: '',
    success: true,
    open: false,
  });

  // ===============================
  // 🚀 FETCH CATEGORIES (GET)
  // ===============================
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(data.categories || []);
    } catch (error) {
      handleError(error, 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ===============================
  // ➕ CREATE CATEGORY (POST)
  // ===============================
  const createCategory = async () => {
    if (!newCategory.trim()) {
      setFeedback({ message: 'Category name required', success: false, open: true });
      return;
    }

    setAddLoading(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/categories`,
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCategories();
      setFeedback({ message: data.message || 'Category added!', success: true, open: true });
      setNewCategory('');
      setOpenAddDialog(false);
    } catch (error) {
      handleError(error, 'Failed to add category');
    } finally {
      setAddLoading(false);
    }
  };

  // ===============================
  // ✏️ UPDATE CATEGORY (PUT)
  // ===============================
  const updateCategory = async () => {
    if (!editCategory.trim() || !editId) {
      setFeedback({ message: 'Invalid input', success: false, open: true });
      return;
    }

    setEditLoading(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/categories/${editId}`,
        { name: editCategory, status: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories((prev) =>
        prev.map((c) => (c.id === editId ? { ...c, name: editCategory } : c))
      );
      setFeedback({ message: data.message || 'Category updated!', success: true, open: true });
      setEditCategory('');
      setEditId(null);
      setOpenEditDialog(false);
    } catch (error) {
      handleError(error, 'Failed to update category');
    } finally {
      setEditLoading(false);
    }
  };

  // ===============================
  // 🗑️ DELETE CATEGORY (DELETE)
  // ===============================
  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const { data } = await axios.delete(`${BASE_URL}/categories/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      setFeedback({ message: data.message || 'Category deleted!', success: true, open: true });
    } catch (error) {
      handleError(error, 'Failed to delete category');
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // ===============================
  // ⚙️ Helper functions
  // ===============================
  const handleError = (error, fallbackMsg) => {
    console.error(error);
    const msg = error.response?.data?.message || fallbackMsg;
    setFeedback({ message: msg, success: false, open: true });
  };

  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const openEditModal = (item) => {
    setEditCategory(item.name);
    setEditId(item.id);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  // ===============================
  // ✅ JSX RENDER
  // ===============================
  return (
    <Box sx={{ maxWidth: 1000,  p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Categories</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your categories
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddDialog(true)}>
          Add Category
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.12)' }}>
        {loading ? (
          <Box sx={{ p: 5, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "20%" }}><strong>#</strong></TableCell>
                <TableCell sx={{ width: "30%" }}><strong>Category Name</strong></TableCell>
                <TableCell sx={{ width: "30%" }}><strong>Slug</strong></TableCell>
                <TableCell sx={{ width: "20%" }} align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((cat, index) => (
                  <TableRow key={cat.id} hover>
                    <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>{cat.slug}</TableCell>
                    <TableCell align="right">
                      <div style={{}}>
                        <IconButton
                          color="info"
                          onClick={() => openEditModal(cat)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(cat.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          color="primary"
                          onClick={() => window.open(`${Live_webiste_URL}/category/${cat.slug}`, "_blank")}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

              {categories.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                    No category found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        <TablePagination
          component="div"
          count={categories.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </TableContainer>

      {/* Add Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Category Name"
            fullWidth
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="inherit">Cancel</Button>
          <LoadingButton
            onClick={createCategory}
            loading={addLoading}
            variant="contained"
          >
            Add
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Category Name"
            fullWidth
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="inherit">Cancel</Button>
          <LoadingButton
            onClick={updateCategory}
            loading={editLoading}
            variant="contained"
          >
            Save
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>Are you sure you want to delete this category?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
          <LoadingButton
            onClick={confirmDelete}
            loading={deleteLoading}
            color="error"
            variant="contained"
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={3000}
        onClose={() => setFeedback({ ...feedback, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setFeedback({ ...feedback, open: false })}
          severity={feedback.success ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Categories;