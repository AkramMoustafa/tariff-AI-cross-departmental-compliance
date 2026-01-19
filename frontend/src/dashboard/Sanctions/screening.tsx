import React from "react";

const inputClass =
  "w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none";
const labelClass = "text-sm font-medium text-gray-700";
const sectionClass =
  "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm";

export const SupplierIdentityStep: React.FC = () => {
  return (
    <div className="mx-auto max-w-2xl p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Supplier Sanctions Screening
        </h1>
        <p className="mt-2 text-gray-600 text-sm">
          Start by providing basic information about the supplier.  
          All fields are optional — enter what you know.
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6">
        <section className={sectionClass}>
          <h2 className="mb-4 text-lg font-semibold">
            Step 1: Supplier Identity
          </h2>

          <div className="space-y-4">
            {/* Company Name */}
            <div>
              <label className={labelClass}>Company / Legal Entity Name</label>
              <input
                className={inputClass}
                type="text"
                placeholder="e.g. Acme Trading LLC"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the legal name if known. Trade names are acceptable.
              </p>
            </div>

            {/* Website */}
            <div>
              <label className={labelClass}>Company Website (optional)</label>
              <input
                className={inputClass}
                type="url"
                placeholder="https://www.example.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                Website is optional. Many suppliers may not have one.
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-xl border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierIdentityStep;
