import React, { useState } from "react"
import apiClient from "@/api/client"
import { useEffect } from "react";

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
}
useEffect(() => {
  const normalized = query.replace(/\D/g, "")
  setExpandedCategory(null)
  setCategoryProducts({})
  setSelectedCode(null)
  setError(null)
  if (query.trim().length < 3) {
    setResults([])
    setHsTree(null)
    return
  }

  if (/^\d+(\.\d+)*$/.test(query)) {
    const fetchTree = async () => {
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
    }

    fetchTree()
    return
  }

  const fetchAI = async () => {
    try {
      setLoading(true)
      const { data } = await apiClient.get("/hs/search", {
        params: { q: query.trim() },
      })

      const rawResults = Array.isArray(data.results) ? data.results : []

      // 🔥 Only show 4-digit headings initially
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

  fetchAI()

}, [query])
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

    {selectedCode ? (
      <div style={styles.selectedMode}>
        <div style={styles.selectedContent}>
          <div>
            <div style={styles.selectedLabel}>Classification Selected</div>
            <div style={styles.selectedValue}>{selectedCode}</div>
          </div>

          <button onClick={handleClear} style={styles.changeButton}>
            Change
          </button>
        </div>
      </div>
    ) : (
      <>
        {/* Header */}
        <div style={styles.headerRow}>
          
        <div style={styles.sectionHeader}>
 <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
  CLASSIFICATION
</Typography>   

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
        </div>

        {error && (
          <div style={styles.errorBox}>{error}</div>
        )}

        {query.length >= 3 && !loading && !hsTree && results.length === 0 && (
          <div style={styles.emptyState}>
            No matching HS codes found.
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={styles.resultsBox}>
            {results.map((item) => (
              <div
                key={item.hs_code}
                onClick={async () => {
                  const normalized = item.hs_code.replace(/\D/g, "")

                  if (normalized.length === 4) {
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

                  setSelectedCode(item.hs_code)
                  onSelect(item.hs_code)
                }}
                style={styles.resultCard}
              >
                <div>
                  <div style={styles.code}>{item.hs_code}</div>
                  <div style={styles.description}>{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hsTree && (
          <div
            onClick={() => {
              const mostSpecific = hsTree[hsTree.length - 1]
              setSelectedCode(mostSpecific?.hs_code)
              onSelect(mostSpecific?.hs_code)
            }}
            style={styles.selectionBox}
          >
            {treeLoading && <div>Loading HS hierarchy...</div>}

            {hsTree.map((node: any, idx: number) => (
              <div key={idx} style={{ marginBottom: 4 }}>
                <strong>{node.hs_code}</strong> — {node.description}
              </div>
            ))}
          </div>
        )}
      </>
    )}
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
      maxWidth: "1000px",
      height: "350px",
      padding: "16px 0",   
      display: "flex",
      flexDirection: "column",
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
        height: 42,
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        padding: "0 14px",
        transition: "all 160ms ease",
      },

      rowContent: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      flex: 1,
      overflow: "hidden",
      },
input: {
  flex: 1,
  border: "none",
  outline: "none",
  fontSize: 14,
  fontWeight: 500,
  color: "#0f172a",
  background: "transparent",
  fontFamily: "inherit",
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
