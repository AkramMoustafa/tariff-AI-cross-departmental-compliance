import React, { useState } from "react"
import apiClient from "@/api/client"

type HSCategoryResult = {
  hs_code: string
  description: string
  score?: number
}

export default function HsLookup() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<HSCategoryResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [categoryProducts, setCategoryProducts] = useState<Record<string, HSCategoryResult[]>>({})
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null)

  const searchHS = async () => {
    setHasSearched(true)
    if (query.trim().length < 3) return

    setLoading(true)
    setError(null)
    setSelectedCode(null)
    setExpandedCategory(null)
    setCategoryProducts({})
    setResults([])

    try {
      const { data } = await apiClient.get("/hs/search", {
        params: { q: query.trim() },
      })

      setResults(Array.isArray(data.results) ? data.results : [])
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") searchHS()
  }

  const confidenceColor = (score?: number) => {
    if (!score) return "#9ca3af"
    if (score >= 0.9) return "#16a34a"
    if (score >= 0.75) return "#f59e0b"
    return "#6b7280"
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Smart HS Code Classification</h2>
          <p style={styles.subtitle}>
            Describe your product to identify the most relevant HS codes.
          </p>
        </div>

        {/* Search */}
        <div style={styles.searchRow}>
          <input
            type="text"
            placeholder="e.g. Men's leather winter jacket with zipper"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            style={styles.input}
          />
          <button
            onClick={searchHS}
            disabled={loading}
            style={{
              ...styles.button,
              background: loading ? "#9ca3af" : "#111827"
            }}
          >
            {loading ? "Searching..." : "Classify"}
          </button>
        </div>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {hasSearched && !loading && results.length === 0 && (
          <div style={styles.emptyState}>
            No matching HS codes found.
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={styles.resultsBox}>
            {results.map((item) => (
              <div key={item.hs_code} style={styles.resultWrapper}>
                <div
                  onClick={async () => {
                    if (expandedCategory === item.hs_code) {
                      setExpandedCategory(null)
                    } else {
                      setExpandedCategory(item.hs_code)
                      if (!categoryProducts[item.hs_code]) {
                        await fetchProducts(item.hs_code)
                      }
                    }
                  }}
                  style={{
                    ...styles.resultCard,
                    boxShadow:
                      expandedCategory === item.hs_code
                        ? "0 6px 16px rgba(0,0,0,0.06)"
                        : "none"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={styles.code}>
                      {item.hs_code}
                    </div>
                    <div style={styles.description}>
                      {item.description}
                    </div>
                  </div>

                  {item.score && (
                    <div style={styles.confidenceContainer}>
                      <div
                        style={{
                          ...styles.confidenceBar,
                          width: `${Math.round(item.score * 100)}%`,
                          background: confidenceColor(item.score)
                        }}
                      />
                      <div style={styles.confidenceText}>
                        {Math.round(item.score * 100)}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Drilldown */}
                {expandedCategory === item.hs_code && (
                  <div style={styles.drilldown}>
                    {loadingCategory === item.hs_code && (
                      <div style={styles.loadingText}>
                        Loading subheadings...
                      </div>
                    )}

                    {categoryProducts[item.hs_code]?.map(product => (
                      <div
                        key={product.hs_code}
                        onClick={() => setSelectedCode(product.hs_code)}
                        style={{
                          ...styles.productCard,
                          background:
                            selectedCode === product.hs_code
                              ? "#e0f2fe"
                              : "#ffffff"
                        }}
                      >
                        <strong>{product.hs_code}</strong>
                        <div style={{ fontSize: "13px", color: "#374151" }}>
                          {product.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Selected */}
        {selectedCode && (
          <div style={styles.selectionBox}>
            <div style={{ fontWeight: 600 }}>Classification Selected</div>
            <div style={{ marginTop: 6 }}>{selectedCode}</div>
          </div>
        )}
      </div>
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
    maxWidth: "820px",
    margin: "auto",
    background: "#ffffff",
    borderRadius: 16,
    padding: 40,
    border: "1px solid #e5e7eb",
    boxShadow: "0 12px 28px rgba(0,0,0,0.06)",
  },
  header: {
    marginBottom: 30
  },
  title: {
    marginBottom: 6,
    fontWeight: 600
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280"
  },
  searchRow: {
    display: "flex",
    gap: 12,
    marginBottom: 30
  },
  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 14
  },
  button: {
    padding: "12px 20px",
    borderRadius: 10,
    border: "none",
    color: "white",
    fontWeight: 500,
    cursor: "pointer"
  },
  resultsBox: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 20,
    background: "#f9fafb"
  },
  resultWrapper: {
    marginBottom: 16
  },
  resultCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    cursor: "pointer",
    transition: "0.2s"
  },
  code: {
    fontWeight: 600,
    fontSize: 15,
    marginBottom: 4
  },
  description: {
    fontSize: 14,
    color: "#374151"
  },
  confidenceContainer: {
    width: 80,
    marginLeft: 20
  },
  confidenceBar: {
    height: 6,
    borderRadius: 6,
    marginBottom: 4
  },
  confidenceText: {
    fontSize: 12,
    textAlign: "right",
    color: "#6b7280"
  },
  drilldown: {
    marginTop: 8,
    paddingLeft: 18
  },
  productCard: {
    padding: 10,
    marginTop: 8,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    cursor: "pointer"
  },
  selectionBox: {
    marginTop: 30,
    padding: 18,
    borderRadius: 12,
    border: "1px solid #bae6fd",
    background: "#f0f9ff"
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
  }
}
