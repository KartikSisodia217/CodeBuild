import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Chip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../services/userService";

function UserManagement() {

  const [users, setUsers] = useState([]);

  const [filteredUsers, setFilteredUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [open, setOpen] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, search]);

  async function loadUsers() {

    setLoading(true);

    try {

      const data = await getUsers();

      setUsers(data);

      setFilteredUsers(data);

    } catch (error) {

      console.error(error);

    }

    setLoading(false);

  }

  function filterUsers() {

    if (search.trim() === "") {

      setFilteredUsers(users);

      return;

    }

    const result = users.filter((user) =>

      user.full_name
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      user.email
        .toLowerCase()
        .includes(search.toLowerCase())

    );

    setFilteredUsers(result);

  }

  function handleOpenCreate() {

    setEditingUser(null);

    setFormData({

      full_name: "",

      email: "",

      password: "",

    });

    setOpen(true);

  }

  function handleEdit(user) {

    setEditingUser(user);

    setFormData({

      full_name: user.full_name,

      email: user.email,

      password: "",

    });

    setOpen(true);

  }

  function handleClose() {

    setOpen(false);

  }

  async function handleSave() {

    try {

      if (editingUser) {

        await updateUser(editingUser.id, {

          full_name: formData.full_name,

          email: formData.email,

          is_active: true,

        });

        setSnackbar({

          open: true,

          severity: "success",

          message: "User Updated Successfully",

        });

      }

      else {

        await createUser(formData);

        setSnackbar({

          open: true,

          severity: "success",

          message: "User Created Successfully",

        });

      }

      loadUsers();

      handleClose();

    }

    catch (error) {

      console.error(error);

      setSnackbar({

        open: true,

        severity: "error",

        message: "Operation Failed",

      });

    }

  }

  async function handleDelete(id) {

    if (!window.confirm("Delete this user?")) {

      return;

    }

    try {

      await deleteUser(id);

      loadUsers();

      setSnackbar({

        open: true,

        severity: "success",

        message: "User Deleted",

      });

    }

    catch (error) {

      console.error(error);

    }

  }

  function handleSnackbarClose() {

    setSnackbar({

      ...snackbar,

      open: false,

    });

  }

  return (

    <>

      <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mb: 4,
    flexWrap: "wrap",
    gap: 2,
  }}
>
  <Box>
    <Typography
      variant="h4"
      sx={{
        fontWeight: 700,
        color: "#111827",
      }}
    >
      User Management
    </Typography>

    <Typography
      sx={{
        color: "#6B7280",
        mt: 0.5,
      }}
    >
      Manage registered users
    </Typography>
  </Box>

  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={handleOpenCreate}
    sx={{
      px: 3.5,
      py: 1.2,
      borderRadius: "14px",
      textTransform: "none",
      fontWeight: 600,
      fontSize: 15,
      background:
        "linear-gradient(90deg,#2563EB,#3B82F6)",
      boxShadow:
        "0 10px 25px rgba(37,99,235,.25)",

      "&:hover": {
        background:
          "linear-gradient(90deg,#1D4ED8,#2563EB)",
        transform: "translateY(-2px)",
      },
    }}
  >
    Add User
  </Button>
</Box>
      <Paper
  elevation={2}
  sx={{
    p: 2,
    mb: 4,
    borderRadius: "18px",
  }}
>
  <TextField
    fullWidth
    placeholder="Search users..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    InputProps={{
      startAdornment: <SearchIcon sx={{ mr: 1, color: "#6B7280" }} />,
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: "14px",
      },
    }}
  />
</Paper>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >

        <DialogTitle>

          {editingUser ? "Edit User" : "Create User"}

        </DialogTitle>

        <DialogContent>

          <TextField
            fullWidth
            margin="normal"
            label="Full Name"
            value={formData.full_name}
            onChange={(e)=>
              setFormData({
                ...formData,
                full_name:e.target.value
              })
            }
          />

          <TextField
            fullWidth
            margin="normal"
            label="Email"
            value={formData.email}
            onChange={(e)=>
              setFormData({
                ...formData,
                email:e.target.value
              })
            }
          />

          {!editingUser && (

            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e)=>
                setFormData({
                  ...formData,
                  password:e.target.value
                })
              }
            />

          )}

        </DialogContent>

        <DialogActions>

          <Button onClick={handleClose}>

            Cancel

          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
          >

            {editingUser ? "Update" : "Create"}

          </Button>

        </DialogActions>

      </Dialog>
            <Paper
  elevation={0}
  sx={{
    borderRadius: 5,
    overflow: "hidden",
    border: "1px solid #E5E7EB",
  }}
>
  <TableContainer>
    <Table>

      <TableHead
        sx={{
          backgroundColor: "#F9FAFB",
        }}
      >
        <TableRow>

          <TableCell>
            <Typography fontWeight={700} color="#374151">
              ID
            </Typography>
          </TableCell>

          <TableCell>
            <Typography fontWeight={700} color="#374151">
              Full Name
            </Typography>
          </TableCell>

          <TableCell>
            <Typography fontWeight={700} color="#374151">
              Email
            </Typography>
          </TableCell>

          <TableCell>
            <Typography fontWeight={700} color="#374151">
              Status
            </Typography>
          </TableCell>

          <TableCell align="center">
            <Typography fontWeight={700} color="#374151">
              Actions
            </Typography>
          </TableCell>

        </TableRow>
      </TableHead>

      <TableBody>

        {loading ? (

          <TableRow>

            <TableCell colSpan={5} align="center">
              Loading...
            </TableCell>

          </TableRow>

        ) : (

          filteredUsers
            .slice(
              page * rowsPerPage,
              page * rowsPerPage + rowsPerPage
            )
            .map((user) => (

              <TableRow key={user.id} hover>

                <TableCell>{user.id}</TableCell>

                <TableCell>{user.full_name}</TableCell>

                <TableCell>{user.email}</TableCell>

                <TableCell>
                  <Chip
                    label={user.is_active ? "Active" : "Inactive"}
                    color={user.is_active ? "success" : "error"}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      borderRadius: "8px",
                      px: 1,
                      minWidth: 90,
                    }}
                  />
                </TableCell>

                <TableCell align="center">

                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(user)}
                    sx={{
                      bgcolor: "#EFF6FF",
                      mr: 1,
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: "#DBEAFE",
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => handleDelete(user.id)}
                    sx={{
                      bgcolor: "#FEF2F2",
                      borderRadius: 2,
                      "&:hover": {
                        bgcolor: "#FEE2E2",
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>

                </TableCell>

              </TableRow>

            ))

        )}

      </TableBody>

    </Table>
  </TableContainer>

  <TablePagination
    component="div"
    count={filteredUsers.length}
    page={page}
    rowsPerPage={rowsPerPage}
    onPageChange={(event, newPage) => setPage(newPage)}
    onRowsPerPageChange={(event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    }}
    rowsPerPageOptions={[5, 10, 20]}
    sx={{
      borderTop: "1px solid #E5E7EB",
      backgroundColor: "#FAFAFA",
    }}
  />

</Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >

        <Alert
          severity={snackbar.severity}
          onClose={handleSnackbarClose}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>

      </Snackbar>

    </>

  );

}

export default UserManagement;