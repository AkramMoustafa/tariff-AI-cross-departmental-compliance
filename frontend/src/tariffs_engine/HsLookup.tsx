import React, { useState } from "react"
import apiClient from "@/api/client"
import CircularProgress from "@mui/material/CircularProgress";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

type HSCategoryResult = {
  hs_code: string
  description: string
  score?: number
}
import { Box, Paper, Typography, TextField, Button } from "@mui/material";

export default function HsLookup({
  onSelect,
}: {
  onSelect: (hsCode: string) => void;
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<HSCategoryResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [categoryProducts, setCategoryProducts] = useState<Record<string, HSCategoryResult[]>>({})
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
const [hsTree, setHsTree] = useState<any[] | null>(null)
const [treeLoading, setTreeLoading] = useState(false)
 const handleClear = () => {
  setQuery("")
  setResults([])
  setHsTree(null)
  setSelectedCode(null)
  setExpandedCategory(null)
  setCategoryProducts({})
  setError(null)
  setHasSearched(false) 
}
const handleSearch = async () => {
  setHasSearched(true) 
  const trimmed = query.trim()
  const normalized = trimmed.replace(/\D/g, "")

  setExpandedCategory(null)
  setCategoryProducts({})
  setSelectedCode(null)
  setError(null)

  if (trimmed.length < 3) {
    setResults([])
    setHsTree(null)
    return
  }

  // Numeric → Tree lookup
  if (/^\d+(\.\d+)*$/.test(trimmed)) {
    try {
      setTreeLoading(true)
      const { data } = await apiClient.get("/tariffs/hs/tree", {
        params: { hs_code: normalized },
      })
      setHsTree(data.tree)
      setResults([])
    } catch (err) {
      setHsTree(null)
    } finally {
      setTreeLoading(false)
    }
    return
  }

  // AI Search
  try {
    setLoading(true)
    const { data } = await apiClient.get("/hs/search", {
      params: { q: trimmed },
    })

    const rawResults = Array.isArray(data.results) ? data.results : []

    const filtered = rawResults.filter((item: HSCategoryResult) => {
      const normalized = item.hs_code.replace(/\D/g, "")
      return normalized.length === 4
    })

    setResults(filtered)
    setHsTree(null)
  } catch (err: any) {
    setError(err.response?.data?.detail || err.message)
  } finally {
    setLoading(false)
  }
}

  const fetchProducts = async (code: string) => {
    setLoadingCategory(code)
    try {
      const { data } = await apiClient.get("/hs/drilldown", {
        params: { code },
      })

      setCategoryProducts(prev => ({
        ...prev,
        [code]: data.results
      }))
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingCategory(null)
    }
  }

  const confidenceColor = (score?: number) => {
    if (!score) return "#9ca3af"
    if (score >= 0.9) return "#16a34a"
    if (score >= 0.75) return "#f59e0b"
    return "#6b7280"
  }

return (
  <div style={styles.container}>


      <>
        {/* Header */}
        <div style={styles.headerRow}>
                      
                    <div style={styles.sectionHeader}>
            <div style={styles.headerSection}>
              <div>
                <div style={styles.sectionLabel}>Classification</div>
                <div style={styles.sectionSubtitle}>
                  Search or enter an HS code to begin classification.
                </div>
              </div>
            </div>

            </div>

                      {query && (
                        <button onClick={handleClear} style={styles.clearButton}>
                          Clear
                        </button>
                      )}
                    </div>

        {/* Search */}
<div style={styles.searchRow}>
  <span style={styles.searchIcon}>🔍</span>

  <input
    type="text"
    placeholder="e.g. Men's leather winter jacket with zipper"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    style={styles.input}
  />

<button
  onClick={handleSearch}
  disabled={loading || treeLoading || query.trim().length < 3}
  style={{
    ...styles.searchButton,
    opacity:
      loading || treeLoading || query.trim().length < 3 ? 0.6 : 1,
    cursor:
      loading || treeLoading || query.trim().length < 3
        ? "not-allowed"
        : "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
  }}
>
  {(loading || treeLoading) && (
    <CircularProgress size={14} sx={{ color: "#ffffff" }} />
  )}
  {loading || treeLoading ? "Searching..." : "Search"}
</button>

</div>
        {error && (
          <div style={styles.errorBox}>{error}</div>
        )}

        {hasSearched && query.trim().length >= 3 && !loading && !treeLoading && !hsTree && results.length === 0 && !error && (
          <div style={styles.emptyState}>
            No matching HS codes found.
          </div>
        )}


        {/* Results */}
        {results.length > 0 && (
          <div style={styles.resultsBox}>
            {results.map((item) => (
  <Paper
    key={item.hs_code}
    elevation={0}
    onClick={async () => {
  const normalized = item.hs_code.replace(/\D/g, "")

  if (normalized.length < 10) {
    try {
      setLoading(true)
      const { data } = await apiClient.get("/hs/drilldown", {
        params: { code: item.hs_code },
      })
      setResults(data.results)
    } finally {
      setLoading(false)
    }
    return
  }

  // final tariff line
  setSelectedCode(item.hs_code)
setResults([])        // 👈 clear results dropdown
setHsTree(null)       // 👈 clear tree if present
setHasSearched(false) // 👈 optional, prevents empty message
onSelect(item.hs_code)
}}

    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 14px",
      zIndex: 2,
      borderRadius: 2,
     border:
  selectedCode === item.hs_code
    ? "1px solid #1e3a8a"
    : "1px solid #e5e7eb",

backgroundColor:
  selectedCode === item.hs_code
    ? "#eef2ff"
    : "#ffffff",
      cursor: "pointer",
      transition: "all 0.15s ease",
      "&:hover": {
        backgroundColor: "#f1f5f9",
        borderColor: "#cbd5e1",
        transform: "translateY(-1px)",
      },
      "&:active": {
        transform: "scale(0.98)",
      },
    }}
  >
    <Box>
      <Typography fontWeight={600} fontSize={13}>
        {item.hs_code}
      </Typography>
      <Typography fontSize={12} color="#4b5563">
        {item.description}
      </Typography>
    </Box>

    <ChevronRightIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
  </Paper>
))}
          </div>
        )}
{!hasSearched && !loading && !treeLoading && !results.length && !hsTree && (
  <Box mt={2}>
    <Typography fontSize={13} color="#64748b" mb={1}>
      Try one of these examples:
    </Typography>

    <Box display="flex" flexDirection="column" gap={1}>
      {[
        "Men's leather jacket",
        "Electric motor 5kW",
        "Frozen Atlantic salmon",
        "8703.23.01",
      ].map((example) => (
        <Box
          key={example}
          onClick={() => setQuery(example)}
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            fontSize: 13,
            backgroundColor: "#f8fafc",
            border: "1px solid #e5e7eb",
            cursor: "pointer",
            transition: "all 0.15s ease",
            "&:hover": {
              backgroundColor: "#eef2ff",
              borderColor: "#cbd5e1",
              transform: "translateX(4px)",
            },
          }}
        >
          {example}
        </Box>
      ))}
    </Box>
  </Box>
)}

{hsTree && (
  <Paper
    elevation={0}
    onClick={() => {
      const mostSpecific = hsTree[hsTree.length - 1]
      setSelectedCode(mostSpecific?.hs_code)
      onSelect(mostSpecific?.hs_code)
    }}
    sx={{
      marginTop: 2,
      padding: "14px",
      borderRadius: 2,
      border: "1px solid #e5e7eb",
      backgroundColor: "#ffffff",
      cursor: "pointer",
      transition: "all 0.15s ease",
      "&:hover": {
        backgroundColor: "#f1f5f9",
        borderColor: "#cbd5e1",
        transform: "translateY(-1px)",
      },
      "&:active": {
        transform: "scale(0.98)",
      },
    }}
  >
    {treeLoading && (
      <Typography fontSize={13} color="#6b7280">
        Loading HS hierarchy...
      </Typography>
    )}

    {hsTree.length > 0 && (
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontSize={13}>
          {hsTree.map((node: any, idx: number) => (
            <span key={idx}>
              <strong>{node.hs_code}</strong> — {node.description}
              {idx < hsTree.length - 1 && " → "}
            </span>
          ))}
        </Typography>

        <ChevronRightIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
      </Box>
    )}
  </Paper>
)}
      </>
    
  </div>
)

          }

          const styles: Record<string, React.CSSProperties> = {
            page: {
              minHeight: "100vh",
              background: "linear-gradient(to bottom right, #f8fafc, #eef2ff)",
              padding: "60px 20px",
              fontFamily: "Inter, sans-serif",
            },
      container: {
        maxWidth: "1200px",
        margin: "0 auto",
        background: "#ffffff",
        borderRadius: 16,
        padding: "32px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      },

      header: {
        marginBottom: 30
      },
      title: {
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: "-0.3px",
      marginBottom: 8,
      },
      subtitle: {
        fontSize: 14,
        color: "#6b7280"
      },
searchRow: {
  display: "flex",
  alignItems: "center",
  height: 52,
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  background: "#f8fafc",
  padding: "0 16px",
  transition: "all 0.2s ease",
},
      rowContent: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      flex: 1,
      overflow: "hidden",
      },searchButton: {
  marginLeft: 10,
  height: 32,
  padding: "0 16px",
  borderRadius: 8,
  border: "none",
  background: "#1e3a8a",
  color: "#ffffff",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
},
input: {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: 15,
  fontWeight: 500,
  color: "#0f172a",
  background: "transparent",
},

      headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 30,
      },
      clearButton: {
      fontSize: 13,
      fontWeight: 500,
      color: "#2563eb",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      marginLeft: 20,   // 👈 moves it slightly right
      marginTop: 6      // 👈 aligns vertically with subtitle
      },
      button: {
      height: 36,                 // controls actual size
      padding: "0 18px",          // horizontal only
      borderRadius: 999,
      border: "none",
      background: "#6366f1",
      color: "#111827",
      fontWeight: 600,
      fontSize: 13,
      letterSpacing: "0.3px",
      textTransform: "uppercase",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
      }
      ,
      resultsBox: {
      marginTop: 8,
      borderRadius: 8,
      position: "relative",
      zIndex: 1,
      background: "#ffffff",
      overflowY: "auto",
      maxHeight: "200px",
      border: "1px solid #e5e7eb",
      },
      resultCard: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      background: "#ffffff",
      cursor: "pointer",
      transition: "0.2s"
      },
      code: {
      fontWeight: 600,
      fontSize: 13,
      marginBottom: 2
      },
      description: {
      fontSize: 12,
      color: "#4b5563",
      lineHeight: 1.3,
      display: "-webkit-box",
      WebkitLineClamp: 2,         
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      },
      confidenceContainer: {
      width: 50,
      marginLeft: 10,
      flexShrink: 0
      },
      confidenceBar: {
      height: 4,
      borderRadius: 4,
      marginBottom: 2
      },
      confidenceText: {
      fontSize: 10,
      textAlign: "right",
      color: "#6b7280"
      },
      drilldown: {
      paddingLeft: 24,
      paddingTop: 4,
      paddingBottom: 4,
      },
      productCard: {
      padding: "6px 12px",
      cursor: "pointer",
      fontSize: 12,
      display: "flex",
      flexDirection: "column",
      },
      selectionBox: {
      marginTop: 14,
      padding: "10px 14px",
      borderRadius: 8,
      border: "1px solid #ffffff",
      background: "#ffffff",
      fontSize: 13,
      },
      errorBox: {
      padding: 12,
      background: "#fee2e2",
      color: "#991b1b",
      borderRadius: 8,
      marginBottom: 16
      },
      headerSection: {
  marginBottom: 24,
},

sectionLabel: {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "1px",
  textTransform: "uppercase",
  color: "#64748b",
  marginBottom: 6,
},

sectionSubtitle: {
  fontSize: 14,
  color: "#475569",
},
      emptyState: {
      fontSize: 14,
      color: "#6b7280"
      },
      loadingText: {
      fontSize: 13,
      color: "#6b7280"
      },selectedMode: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      },searchIcon: {
      marginRight: 8,
      fontSize: 14,
      color: "#6b7280",
      },


      selectedContent: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      padding: "24px",
      borderRadius: 16,
      background: "#ffffff",
      border: "1px solid #ffffff",
      boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
      },

      selectedLabel: {
      fontSize: 13,
      fontWeight: 600,
      color: "#6b7280",
      marginBottom: 8,
      },
      selectedValue: {
      fontSize: 26,
      fontWeight: 700,
      color: "#1f2937",
      letterSpacing: "0.5px",
      },
      changeButton: {
      fontSize: 12,
      fontWeight: 600,
      color: "#1e3a8a",
      background: "rgba(30, 58, 138, 0.08)",
      border: "1px solid rgba(30, 58, 138, 0.15)",
      padding: "6px 12px",
      borderRadius: 8,
      cursor: "pointer",
      transition: "all 0.2s ease",
      },sectionHeader: {
      paddingBottom: 16,
      marginBottom: 20,
      borderBottom: "1px solid #e5e7eb",
      },

      }
