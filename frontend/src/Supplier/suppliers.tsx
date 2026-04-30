import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";

import { getSuppliers } from "../api/SupplierIntelligence";

export default function Suppliers() {
  const navigate = useNavigate();
  type Supplier = {
  id: number;
  name: string;
  country: string;
};

const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const data = await getSuppliers();
        setSuppliers(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadSuppliers();
  }, []);

  return (
    <Box sx={{ maxWidth: 1300, mx: "auto", mt: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Header Row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography fontSize={22} fontWeight={700}>
            Suppliers
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/SupplierIntake")}
          >
            Add Supplier
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Supplier</TableCell>
              <TableCell>Country</TableCell>
        
              <TableCell>Actions</TableCell>
            </TableRow>
            
          </TableHead>
          
          
<TableBody>
 {suppliers.length === 0 ? (
  <TableRow>
    <TableCell colSpan={3} align="center">
      No suppliers yet
    </TableCell>
  </TableRow>
) : (
  suppliers.map((supplier) => (
    <TableRow key={supplier.id}>
      <TableCell>{supplier.name}</TableCell>
      <TableCell>{supplier.country}</TableCell>

     

      <TableCell>
        <Button
          variant="outlined"
          onClick={() => navigate(`/suppliers/${supplier.id}`)}
        >
          View Profile
        </Button>
      </TableCell>
    </TableRow>
))
)}
</TableBody>
        </Table>
      </Paper>
    </Box>
  );
}