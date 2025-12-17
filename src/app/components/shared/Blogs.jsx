'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Snackbar,
  Alert,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BASE_URL, { Backend_URL , Live_webiste_URL} from '@/utils/api';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';

const quillModules = {
  toolbar: {
    container: [
      // Headers
      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      // Basic style
      ["bold", "italic", "underline", "strike"],

      // Colors
      [{ color: [] }, { background: [] }],

      // Lists & alignment
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],

      // Undo / Redo
      ["undo", "redo"],

      // Block elements
      ["blockquote", "code-block"],

      // Special
      ["clean"],            // Clear formatting
      ["special"],          // Special characters popup
      // ["pasteText"],        // Paste as plain text

      // Media
      
      ['link', 'image', 'video'],
    ],

    handlers: {
      // ----- UNDO / REDO -----
      undo: function () {
        this.quill.history.undo();
      },
      redo: function () {
        this.quill.history.redo();
      },

      // Special: dispatch a CustomEvent with the quill instance
      special: function () {
        const event = new CustomEvent('openSpecialChars', {
          detail: { quill: this.quill },
        });
        window.dispatchEvent(event);
      },

      // ----- PASTE AS TEXT -----
      pasteText: function () {
        const text = prompt("Paste text:");
        if (!text) return;

        const range = this.quill.getSelection();
        this.quill.insertText(range.index, text);
      },

      // ----- CUSTOM IMAGE HANDLER (Your current code) -----
      image: function () {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();

        input.onchange = async () => {
          const file = input.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result;
            const range = this.quill.getSelection(true);
            this.quill.insertEmbed(range.index, "image", base64);
          };
          reader.readAsDataURL(file);
        };
      },
    },
  },

  // Enable history for undo/redo
  history: {
    delay: 500,
    maxStack: 200,
    userOnly: true,
  },

  // Add keyboard shortcuts
  keyboard: {
    bindings: {
      undo: {
        key: "Z",
        shortKey: true, // cmd+Z or ctrl+Z
        handler(range, context) {
          this.quill.history.undo();
        },
      },
      redo: {
        key: "Z",
        shortKey: true,
        shiftKey: true, // shift+cmd+Z
        handler(range, context) {
          this.quill.history.redo();
        },
      },
      pasteText: {
        key: "V",
        shortKey: true,
        shiftKey: true, // shift+cmd+V
        handler: function () {
          const text = prompt("Paste plain text here:");
          if (text) {
            const range = this.quill.getSelection();
            this.quill.insertText(range.index, text);
          }
        },
      },
    },
  },
};



const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
const [editorMode, setEditorMode] = useState('visual'); // 'visual' or 'code'
  const [newBlog, setNewBlog] = useState({
    title: '',
    slug: '',
    author: '',
    content: '',
    category_ids: [],
    tags: [],
    meta_title: '',
    meta_description: '',
    status: true,
    image: null,
  });

 

  

  const [editBlog, setEditBlog] = useState({ ...newBlog });
  const [editId, setEditId] = useState(null);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({
    message: '',
    success: true,
    open: false,
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const storedUser = JSON.parse(sessionStorage.getItem('user'));
  const token = storedUser?.token;

  // inside Blogs component, near your other state hooks:
const [specialModalOpen, setSpecialModalOpen] = useState(false);
const specialQuillRef = React.useRef(null);

// listen to the custom event and open the modal
useEffect(() => {
  const handler = (ev) => {
    specialQuillRef.current = ev.detail?.quill || null;
    setSpecialModalOpen(true);
  };
  window.addEventListener('openSpecialChars', handler);
  return () => window.removeEventListener('openSpecialChars', handler);
}, []);


    console.log('editBlog.tags', editBlog.tags)
  // 🚀 FETCH BLOGS
   
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/blogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(data.blogs || []);
    } catch (error) {
      handleError(error, 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };
  
console.log('editBlog', editBlog)
   
  // 📂 FETCH CATEGORIES
   
  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(data.categories || []);
    } catch (error) {
      handleError(error, 'Failed to load categories');
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, []);

   
  // 📸 IMAGE UPLOAD HANDLER
   
 const handleImageUpload = (e, isEdit = false) => {
  console.log('isEdit', isEdit)
  const file = e.target.files[0];
  if (!file) return;

  if (isEdit) {
    setEditBlog({ ...editBlog, image: file });
  } else {
    setNewBlog({ ...newBlog, image: file });
  }
};


   
  // ➕ CREATE BLOG
   
const createBlog = async () => {
  if (!newBlog.title.trim() ) {
    setFeedback({
      message: 'Title and at least one category are required',
      success: false,
      open: true,
    });
    return;
  }

  setSaving(true);
  try {
    const formData = new FormData();
    formData.append('title', newBlog.title);
    formData.append('slug', newBlog.slug);
    formData.append('author', newBlog.author);
    formData.append('content', newBlog.content);
    formData.append('meta_title', newBlog.meta_title);
    formData.append('meta_description', newBlog.meta_description);
    formData.append('status', newBlog.status ? 1 : 0);

    // Add image file if present
    if (newBlog.image) formData.append('image', newBlog.image);

    // Append categories and tags
    newBlog.category_ids.forEach(id => formData.append('category_ids[]', id));
    if (newBlog.tags)
      newBlog.tags.forEach(tag => formData.append("tags[]", tag));

    const { data } = await axios.post(`${BASE_URL}/blogs`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    setFeedback({ message: data.message || 'Blog added!', success: true, open: true });
    fetchBlogs();
    setNewBlog({
      title: '',
      slug: '',
      author: '',
      content: '',
      category_ids: [],
      tags: [],
      meta_title: '',
      meta_description: '',
      status: true,
      image: null,
    });
    setOpenAddDialog(false);
  } catch (error) {
    handleError(error, 'Failed to create blog');
  } finally {
    setSaving(false);
  }
};

  // ✏️ UPDATE BLOG
   
const updateBlog = async () => {
  console.log('editBlog.tags.split' ,editBlog)
  if (!editBlog.title.trim() || !editId) {
    setFeedback({ message: 'Invalid data', success: false, open: true });
    return;
  }

  setSaving(true);
  try {
    const formData = new FormData();
    formData.append('title', editBlog.title);
    formData.append('slug', editBlog.slug);
    formData.append('author', editBlog.author);
    formData.append('content', editBlog.content);
    formData.append('meta_title', editBlog.meta_title);
    formData.append('meta_description', editBlog.meta_description);
    formData.append('status', editBlog.status ? 1 : 0);

    if (editBlog.image && typeof editBlog.image !== 'string') {
      // Only append if a new image file is uploaded
      formData.append('image', editBlog.image);
    }

    if(editBlog.category_ids){
     editBlog.category_ids.forEach(id => formData.append('category_ids[]', id));
    }

    if (editBlog.tags){
    editBlog.tags.forEach(tag => formData.append("tags[]", tag));
    }


    const { data } = await axios.post(
      `${BASE_URL}/blogs/${editId}`, // if Laravel-style API
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    setFeedback({ message: data.message || 'Blog updated!', success: true, open: true });
    fetchBlogs();
    setOpenEditDialog(false);
  } catch (error) {
    handleError(error, 'Failed to update blog');
  } finally {
    setSaving(false);
  }
};
   
  // 🗑️ DELETE BLOG
   
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const { data } = await axios.delete(`${BASE_URL}/blogs/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedback({ message: data.message || 'Blog deleted!', success: true, open: true });
      fetchBlogs();
    } catch (error) {
      handleError(error, 'Failed to delete blog');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

   
  // ⚙️ HELPERS
   

  const handleAddCancel = () => {
    setNewBlog({
      title: '',
      slug: '',
      author: '',
      content: '',
      category_ids: [],
      tags: [],
      meta_title: '',
      meta_description: '',
      status: true,
      image: null,
    });
    setOpenAddDialog(false)
  }

  const handleError = (error, fallbackMsg) => {
    console.error(error);
    const msg = error.response?.data?.message || fallbackMsg;
    setFeedback({ message: msg, success: false, open: true });
  };

  const openEditModal = (item) => {
    console.log(item, 'sadasdasd')
    setEditBlog({
  ...item,
  category_ids: item.category_ids.map(id => Number(id)),
})
    setEditId(item.id);
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

 const searchBlogs = async (query) => {
  if (!query.trim()) {
    fetchBlogs();
    return;
  }

  setLoading(true);
  try {
    const { data } = await axios.get(
      `https://dameta1.com/dameta-backend/public/api/blogs/search?query=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setBlogs(data.blogs || []);
  } catch (error) {
    handleError(error, "Search failed");
  } finally {
    setLoading(false);
  }
};


  const handleChangePage = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Accepts array of ids (numbers or strings) and returns array of category names
    const getCategoryNames = (ids = []) => {
      if (!Array.isArray(ids) || ids.length === 0) return [];
      // Normalize IDs to numbers for safe comparison
      const normalized = ids.map((i) => Number(i));
      return normalized
        .map((id) => categories.find((c) => Number(c.id) === id))
        .filter(Boolean)
        .map((c) => c.name);
    };

  // For making slug from title
    const slugify = (text) => text .toLowerCase() .trim() .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-") .replace(/-+/g, "-");

  const TagInput = ({ value = [], onChange }) => {
    const [inputValue, setInputValue] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState("");

    const addTag = () => {
      if (!inputValue.trim()) return;
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    };

    const removeTag = (index) => {
      const updated = value.filter((_, i) => i !== index);
      onChange(updated);
    };

    const handleEditSave = (index) => {
      const updated = [...value];
      updated[index] = editValue.trim();
      onChange(updated);
      setEditingIndex(null);
    };
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Tags</Typography>

        {/* Input Field */}
        <TextField
          fullWidth
          size="small"
          placeholder="Type tag and press Enter"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTag()}
          sx={{ mb: 1 }}
        />

        {/* Tags List */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {value.map((tag, index) => (
            <Chip
              key={index}
              label={
                editingIndex === index ? (
                  <TextField
                    size="small"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSave(index);
                    }}
                    autoFocus
                  />
                ) : (
                  tag
                )
              }
              onDoubleClick={() => {
                setEditingIndex(index);
                setEditValue(tag);
              }}
              onDelete={() => removeTag(index)}
              color="primary"
              variant="outlined"
              sx={{ cursor: "pointer", px: 1 }}
            />
          ))}
        </Box>
      </Box>
    );
};


 console.log('blogs', `${Backend_URL}/${blogs[3]?.image}`)

   
  // ✅ RENDER
   
  return (
    <Box sx={{ maxWidth: 1200, margin: 'auto', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Blogs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your blogs here
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddDialog(true)}>
          Add Blog
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          placeholder="Search blogs"
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);
            searchBlogs(value);  // 🚀 REAL API SEARCH
          }}
          size="small"
          sx={{ flex: 1, maxWidth: 600 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ p: 5, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Image</strong></TableCell>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "none", md: "table-cell" } }}><strong>Categories</strong></TableCell>
                <TableCell><strong>Author</strong></TableCell>
                <TableCell sx={{ display: { xs: "none", sm: "none", md: "table-cell" } }}><strong>Tags</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {blogs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((blog) => (
                  <TableRow key={blog.id} hover>
                    {/* 🖼️ Blog Image */}
                    <TableCell>
                      {blog.image ? (
                        <img
                          src={`${Backend_URL}/${blog.image}`}
                          alt={blog.title}
                          style={{
                            width: 70,
                            height: 70,
                            objectFit: 'cover',
                            borderRadius: 8,
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 70,
                            height: 70,
                            bgcolor: '#f5f5f5',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            fontSize: 12,
                          }}
                        >
                          No Image
                        </Box>
                      )}
                    </TableCell>

                    {/* 📄 Title */}
                    <TableCell align="left"  sx={{ width: { lg: "300px", md: "auto", sm: "auto", xs: "auto" } }}><strong>{blog.title}</strong></TableCell>

                    {/* 🏷️ Categories */}
                        <TableCell sx={{ display: { xs: "none", sm: "none", md: "table-cell" } }}>
                          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap"}}>
                            {(() => {
                              const categories = getCategoryNames(blog.category_ids);
                              const visible = categories.slice(0, 2);           // first 2 categories
                              const remaining = categories.length - 2;          // remaining count

                              return (
                                <>
                                  {visible.map((name, index) => (
                                    <Chip
                                      key={index}
                                      label={name}
                                      size="small"
                                      sx={{
                                        fontWeight: "bold",
                                        fontSize: "0.75rem",
                                        padding: "2px 8px",
                                        borderRadius: "20px",
                                      }}
                                    />
                                  ))}

                                  {remaining > 0 && (
                                    <Chip
                                      label={`+${remaining} more`}
                                      size="small"
                                      sx={{
                                        fontWeight: "bold",
                                        fontSize: "0.75rem",
                                        backgroundColor: "#eeeeee",
                                        color: "#555",
                                        borderRadius: "20px",
                                        padding: "2px 8px",
                                      }}
                                    />
                                  )}
                                </>
                              );
                            })()}
                          </Box>
                        </TableCell>
                    {/* ✍️ Author */}
                    <TableCell>{blog.author}</TableCell>


                    {/* 🔖 Tags */}
                    <TableCell
                    sx={{ display: { xs: "none", sm: "none", md: "table-cell" } }}>
                      {(() => {
                        const visibleTags = blog.tags?.slice(0, 2);          // first 2 tags
                        const remainingCount = blog.tags?.length - 2;        // remaining tags

                        return (
                          <>
                            {visibleTags?.map((name, index) => (
                              <Chip
                                key={index}
                                label={name}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: "0.70rem",
                                  padding: "2px 6px",
                                  borderRadius: "16px",
                                  backgroundColor: "#e3f2fd",
                                  color: "#1976d2",
                                  mr: 0.5,
                                  mb: 0.5,
                                  "& .MuiChip-label": { padding: "0 6px" },
                                }}
                              />
                            ))}

                            {remainingCount > 0 && (
                              <Chip
                                label={`+${remainingCount} more`}
                                size="small"
                                 sx={{
                                  fontWeight: 600,
                                  fontSize: "0.70rem",
                                  padding: "2px 6px",
                                  borderRadius: "16px",
                                  backgroundColor: "#e3f2fd",
                                  color: "#1360adff",
                                  mr: 0.5,
                                  mb: 0.5,
                                  "& .MuiChip-label": { padding: "0 6px" },
                                }}
                              />
                            )}
                          </>
                        );
                      })()}
                    </TableCell>


                    {/* ⚙️ Actions */}
                    <TableCell align="right">
                      <div style={{display:'flex'}}>
                        <IconButton
                          color="info"
                          onClick={() => openEditModal(blog)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(blog.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          color="primary"
                          onClick={() => window.open(`${Live_webiste_URL}/${blog.slug}`, "_blank")}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </TableCell>


                  </TableRow>
                ))}

              {blogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    No blogs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

        )}

        <TablePagination
          component="div"
          count={blogs.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </TableContainer>

      {/* ========== ADD BLOG DIALOG ========== */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Add New Blog</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Title" fullWidth
            value={newBlog.title} 
            onChange={(e) => {
              const t = e.target.value;
              setNewBlog({
                ...newBlog,
                title: t,
                slug: slugify(t) // 🔥 auto slug
              });
            }}
            />
          <TextField
            margin="dense"
            label="Slug"
            fullWidth
            value={newBlog.slug}
          />
          <p>The URL on website will be {newBlog.slug && Live_webiste_URL+'/'+newBlog.slug}</p>
          <TextField margin="dense" label="Author" fullWidth
            value={newBlog.author} onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })} />

          <FormControl fullWidth margin="dense">
            <InputLabel>Select Categories</InputLabel>
            <Select
              multiple
              value={newBlog.category_ids}
              onChange={(e) => setNewBlog({ ...newBlog, category_ids: e.target.value })}
              input={<OutlinedInput label="Select Categories" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => {
                    const cat = categories.find((c) => c.id === id);
                    return <Chip key={id} label={cat ? cat.name : id} />;
                  })}
                </Box>
              )}
            >
              {catLoading ? (
                <MenuItem disabled>Loading...</MenuItem>
              ) : (
                categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TagInput
            value={newBlog.tags}
            onChange={(tags) => setNewBlog({ ...newBlog, tags })}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Upload Image</Typography>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} />
          </Box>

          <TextField
            margin="dense"
            label="Meta Title"
            fullWidth
            value={newBlog.meta_title}
            onChange={(e) => setNewBlog({ ...newBlog, meta_title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Meta Description"
            fullWidth
            multiline
            rows={2}
            value={newBlog.meta_description}
            onChange={(e) => setNewBlog({ ...newBlog, meta_description: e.target.value })}
          />

            {/* Editor Mode Toggle */}
            <div style={{ marginTop: 46, display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
              <div>Content</div>
              <div style={{ display: 'inline-flex' }}>
                <button 
                  onClick={(e) => setEditorMode('visual')}
                  className={`custom-toggle-button ${editorMode === 'visual' ? 'active' : ''}`}
                >
                  <span style={{ marginRight: 8, display: 'flex', alignItems: 'center' }}>
                    👁
                  </span>
                  Visual
                </button>
                
                <button 
                  onClick={(e) => setEditorMode('code')}
                  className={`custom-toggle-button ${editorMode === 'code' ? 'active' : ''}`}
                >
                  <span style={{ marginRight: 8, display: 'flex', alignItems: 'center' }}>
                    &lt;/&gt; 
                  </span>
                  Code
                </button>
              </div>
            </div>
                                            
            {/* Conditional Editor Render */}
            {editorMode === 'visual' ? (
              <ReactQuill
              theme="snow"
              modules={quillModules}
              value={newBlog.content}
              onChange={(value) => setNewBlog({ ...newBlog, content: value })}
              />
            ) : (
              <TextField
                fullWidth
                multiline
                value={newBlog.content} // or editBlog.content
                onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                placeholder="Enter HTML content here..."
                sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,

                  '& fieldset': {
                    borderColor: '#ccc', // default border
                    borderRadius: 0,
                  },

                  '&:hover fieldset': {
                    borderColor: '#ccc !important', // stop blue on hover
                  },

                  '&.Mui-focused fieldset': {
                    borderColor: '#ccc !important', // stop blue on focus
                  },
                },
              }}
              />
            )}

            </DialogContent>
            <DialogActions>
              <Button onClick={() => handleAddCancel()} color="inherit">Cancel</Button>
              <Button onClick={createBlog} variant="contained" disabled={saving}>
                {saving ? 'Saving...' : 'Add Blog'}
              </Button>
            </DialogActions>
          </Dialog>

              {/* Special Characters Modal */}
        <Dialog
          open={specialModalOpen}
          onClose={() => setSpecialModalOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Select special character</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Click a character to insert it at the cursor.
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: 1,
              }}
            >
              {[
                // BASIC
                '©','®','™','✓','✔','✕','•','§','¶','@','#','&',

                // ARROWS
                '→','←','↑','↓','↔','↕','⇒','⇐','⇑','⇓','➜','➤','➥','➦','➧','➨','➩','➲',

                // MATH
                '±','÷','×','=', '≠','≈','≡','≤','≥','∞','∑','∏','√','∫','∂','∆','∇','µ',

                // QUOTES & PUNCTUATION
                '“','”','‘','’','«','»','–','—','…','¡','¿',

                // CURRENCY
                '$','€','£','¥','₩','₽','₹','₱','¢','₴','₦','฿',

                // GREEK LETTERS
                'α','β','γ','δ','ε','θ','λ','μ','π','σ','τ','φ','ψ','Ω','ω',

                // SUPERSCRIPT / SUBSCRIPT
                '¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹','⁰',
                '₁','₂','₃','₄','₅','₆','₇','₈','₉','₀',

                // ACCENTED CHARACTERS
                'á','à','â','ä','ã','å','æ','ç','é','è','ê','ë','í','ì','î','ï',
                'ñ','ó','ò','ô','ö','õ','ø','ß','ú','ù','û','ü','ý','ÿ',

                // SCIENCE & MATH SPECIAL
                '°','‰','Ω','℧','ℓ','∈','∉','⊂','⊃','⊆','⊇','∪','∩','∧','∨','⊕','⊗','⊘',

                // MISC
                '☆','★','✓','✗','✦','✧','♠','♣','♥','♦','♪','♫','✓','✔','✕'
              ].map((ch) => (
                <Button
                  key={ch}
                  onClick={() => {
                    const quill = specialQuillRef.current;
                    if (!quill) return;
                    const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
                    quill.insertText(range.index, ch, 'user');
                    // move cursor after inserted char
                    quill.setSelection(range.index + ch.length, 0);
                    quill.focus();
                    setSpecialModalOpen(false);
                  }}
                  variant="outlined"
                  sx={{ minWidth: 36, minHeight: 36, p: 0.5 }}
                >
                  {ch}
                </Button>
              ))}
            </Box>

            
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSpecialModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>


      {/* ========== EDIT BLOG DIALOG ========== */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Edit Blog</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Title" fullWidth
            value={editBlog.title} 
            onChange={(e) => {
              const t = e.target.value;
              setEditBlog({
                ...editBlog,
                title: t,
                slug: slugify(t)
              });
            }}
            />
          <TextField
            margin="dense"
            label="Slug"
            fullWidth
            value={editBlog.slug}
          />
          <TextField margin="dense" label="Author" fullWidth
            value={editBlog.author} onChange={(e) => setEditBlog({ ...editBlog, author: e.target.value })} />

          <FormControl fullWidth margin="dense">
            <InputLabel>Select Categories</InputLabel>
            <Select
              multiple
              value={editBlog.category_ids || []}
              onChange={(e) => setEditBlog({ ...editBlog, category_ids: e.target.value })}
              input={<OutlinedInput label="Select Categories" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => {
                    const cat = categories.find((c) => c.id === id);
                    console.log('cattt',cat)
                    return <Chip key={id} label={cat ? cat?.name : id} />;
                  })}
                </Box>
              )}
            >
              {catLoading ? (
                <MenuItem disabled>Loading...</MenuItem>
              ) : (
                categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TagInput
            value={editBlog.tags}
            onChange={(tags) => setEditBlog({ ...editBlog, tags })}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Upload Image</Typography>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} />
            {editBlog.image ? (
                <Box sx={{ mt: 1 }}>
                  <img src={Backend_URL + '/'+ editBlog.image} alt="preview" width={150} style={{ borderRadius: 8 }} />
                </Box>
              ):(<>
              <div>
                Save to preview image
              </div>
              </>)
            }
          </Box>

          <TextField
            margin="dense"
            label="Meta Title"
            fullWidth
            value={editBlog.meta_title}
            onChange={(e) => setEditBlog({ ...editBlog, meta_title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Meta Description"
            fullWidth
            multiline
            rows={2}
            value={editBlog.meta_description}
            onChange={(e) => setEditBlog({ ...editBlog, meta_description: e.target.value })}
          />
            {/* Editor Mode Toggle */}
            <div style={{ marginTop: 46, display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
              <div>Content</div>
              <div style={{ display: 'inline-flex' }}>
                <button 
                  onClick={(e) => setEditorMode('visual')}
                  className={`custom-toggle-button ${editorMode === 'visual' ? 'active' : ''}`}
                >
                  <span style={{ marginRight: 8, display: 'flex', alignItems: 'center' }}>
                    👁
                  </span>
                  Visual
                </button>
                
                <button 
                  onClick={(e) => setEditorMode('code')}
                  className={`custom-toggle-button ${editorMode === 'code' ? 'active' : ''}`}
                >
                  <span style={{ marginRight: 8, display: 'flex', alignItems: 'center' }}>
                    &lt;/&gt; 
                  </span>
                  Code
                </button>
              </div>
            </div>

            {/* Conditional Editor Render */}
            {editorMode === 'visual' ? (
              <ReactQuill
             theme="snow"  modules={quillModules} value={editBlog.content}
            onChange={(value) => setEditBlog({ ...editBlog, content: value })}
              />
            ) : (
              <TextField
                fullWidth
                multiline
                rows={15}
                value={editBlog.content} // or editBlog.content
                onChange={(e) => setNewBlog({ ...editBlog, content: e.target.value })}
                placeholder="Enter HTML content here..."
                sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,

                  '& fieldset': {
                    borderColor: '#ccc', // default border
                    borderRadius: 0,
                  },

                  '&:hover fieldset': {
                    borderColor: '#ccc !important', // stop blue on hover
                  },

                  '&.Mui-focused fieldset': {
                    borderColor: '#ccc !important', // stop blue on focus
                  },
                },
              }}
              />
            )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={updateBlog} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>Are you sure you want to delete this blog?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default Blogs;
