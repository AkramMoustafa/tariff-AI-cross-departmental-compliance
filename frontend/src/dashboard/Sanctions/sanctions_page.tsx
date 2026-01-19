import { useEffect, useState } from "react"
import { searchSanctions } from "../../api/client"
import getSanctions from "../../api/client"
type SanctionEntity = {
  name: string | null
  aliases: string[]
  entityType: string | null
  sanctionsList?: string | null
  sanctionsType?: string | null
  sanctionsProgram?: string | null
  countries: string[]
}

export default function SanctionsSearch() {
  const [q, setQ] = useState("")
  const [entityType, setEntityType] = useState("")
  const [country, setCountry] = useState("")

  const [results, setResults] = useState<SanctionEntity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const runSearch = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await searchSanctions({
          q: q || undefined,
          entity_type: entityType || undefined,
          country: country || undefined,
        })

        setResults(data)
      } catch (err) {
        console.error("Sanctions search failed:", err)
        setError("Failed to load sanctions data")
      } finally {
        setLoading(false)
      }
    }

    // debounce to avoid hammering backend
    const t = setTimeout(runSearch, 300)
    return () => clearTimeout(t)
  }, [q, entityType, country])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Sanctions Search
          </h1>
          <p className="text-gray-600">
            Live sanctions data powered by backend search
          </p>
        </div>

        {/* Filters */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            <input
              type="text"
              placeholder="Search name or alias"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="col-span-2 rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
            />

            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
            >
              <option value="">All entity types</option>
              <option value="Individual">Individual</option>
              <option value="Entity">Entity</option>
              <option value="Vessel">Vessel</option>
              <option value="Aircraft">Aircraft</option>
            </select>

            <input
              type="text"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="text-center text-gray-500">
              Loading sanctions…
            </div>
          )}

          {error && (
            <div className="text-center text-red-500">
              {error}
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="text-center text-gray-500">
              No results found
            </div>
          )}

          {results.map((e, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-medium text-gray-900">
                    {e.name ?? "Unnamed Entity"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {e.entityType} • {e.sanctionsProgram}
                  </p>
                </div>

                <div className="text-sm text-gray-500">
                  {e.sanctionsType} ({e.sanctionsList})
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
                <div>
                  <span className="font-medium">Countries:</span>{" "}
                  {e.countries.join(", ")}
                </div>

                {e.aliases.length > 0 && (
                  <div>
                    <span className="font-medium">Aliases:</span>{" "}
                    {e.aliases.join(", ")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
