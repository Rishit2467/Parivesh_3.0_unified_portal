"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";

const STEPS = [
  "Category & Sector",
  "Project Details",
  "Location & Cost",
  "Documents",
  "Review & Submit",
];

function NewApplicationContent() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appId, setAppId] = useState(null);

  const [form, setForm] = useState({
    category_id: "",
    sector_id: "",
    project_name: "",
    project_description: "",
    project_location: "",
    project_state: "",
    project_district: "",
    project_area: "",
    estimated_cost: "",
  });

  // Document upload state
  const [files, setFiles] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/config/categories"), api.get("/config/sectors")])
      .then(([c, s]) => {
        setCategories(c.data.filter((cat) => cat.is_active));
        setSectors(s.data.filter((sec) => sec.is_active));
      })
      .catch(() => toast.error("Failed to load form data"))
      .finally(() => setLoading(false));
  }, []);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // Step 1: Create draft or update
  const saveStep = async () => {
    setSaving(true);
    try {
      if (!appId) {
        const { data } = await api.post("/applications", {
          category_id: Number(form.category_id),
          sector_id: Number(form.sector_id),
          project_name: form.project_name,
        });
        setAppId(data.id);
        toast.success("Draft created");
      } else {
        await api.put(`/applications/${appId}`, form);
        toast.success("Draft saved");
      }
      setStep((s) => s + 1);
    } catch (err) {
      toast.error(err.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !appId) return;
    setUploadingDoc(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("document_type", "project_report");
    fd.append("tag", "application_document");
    try {
      const { data } = await api.post(`/documents/application/${appId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFiles((prev) => [...prev, data]);
      toast.success("Document uploaded");
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploadingDoc(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.put(`/applications/${appId}`, form);
      await api.post(`/applications/${appId}/submit`);
      toast.success("Application submitted successfully!");
      router.push("/proponent/applications");
    } catch (err) {
      toast.error(err.response?.data?.error || "Submission failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <>
      <PageHeader title="New Application" subtitle="Submit a new Environmental Clearance application" />

      {/* Step Indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap
              ${i === step ? "bg-primary-100 text-primary-700" : i < step ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${i === step ? "bg-primary-600 text-white" : i < step ? "bg-green-500 text-white" : "bg-gray-300 text-white"}`}>
                {i < step ? "✓" : i + 1}
              </span>
              {label}
            </div>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      <div className="card max-w-2xl">
        {/* Step 0: Category & Sector */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Category *</label>
              <select required value={form.category_id}
                onChange={(e) => update("category_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-ring">
                <option value="">Select category…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry Sector *</label>
              <select required value={form.sector_id}
                onChange={(e) => update("sector_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-ring">
                <option value="">Select sector…</option>
                {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
              <input required value={form.project_name}
                onChange={(e) => update("project_name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-ring"
                placeholder="E.g. 500 MW Solar Power Plant" />
            </div>
          </div>
        )}

        {/* Step 1: Project Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
              <textarea rows={5} value={form.project_description}
                onChange={(e) => update("project_description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-ring"
                placeholder="Describe the project scope, activities, and expected environmental impact…" />
            </div>
          </div>
        )}

        {/* Step 2: Location & Cost */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input value={form.project_state}
                  onChange={(e) => update("project_state", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input value={form.project_district}
                  onChange={(e) => update("project_district", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-ring" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address</label>
              <input value={form.project_location}
                onChange={(e) => update("project_location", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-ring"
                placeholder="Full address or coordinates" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Area (hectares)</label>
                <input type="number" step="0.01" value={form.project_area}
                  onChange={(e) => update("project_area", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (₹)</label>
                <input type="number" step="0.01" value={form.estimated_cost}
                  onChange={(e) => update("estimated_cost", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus-ring" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Upload project documents (PDF, DOC, DOCX, JPG, PNG — max 10 MB each)</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 text-sm font-medium transition">
              {uploadingDoc ? "Uploading…" : "📎 Choose File"}
              <input type="file" className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleDocUpload} disabled={uploadingDoc} />
            </label>
            {files.length > 0 && (
              <ul className="divide-y divide-gray-100 mt-3">
                {files.map((f) => (
                  <li key={f.id} className="py-2 text-sm flex justify-between">
                    <span>{f.original_name}</span>
                    <span className="text-gray-400">{f.document_type}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-3 text-sm">
            <h4 className="font-semibold text-gray-900">Review Your Application</h4>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <dt className="text-gray-500">Category</dt>
              <dd>{categories.find((c) => String(c.id) === String(form.category_id))?.name || "—"}</dd>
              <dt className="text-gray-500">Sector</dt>
              <dd>{sectors.find((s) => String(s.id) === String(form.sector_id))?.name || "—"}</dd>
              <dt className="text-gray-500">Project</dt><dd>{form.project_name}</dd>
              <dt className="text-gray-500">State</dt><dd>{form.project_state || "—"}</dd>
              <dt className="text-gray-500">District</dt><dd>{form.project_district || "—"}</dd>
              <dt className="text-gray-500">Area</dt><dd>{form.project_area ? `${form.project_area} ha` : "—"}</dd>
              <dt className="text-gray-500">Estimated Cost</dt>
              <dd>{form.estimated_cost ? `₹${Number(form.estimated_cost).toLocaleString("en-IN")}` : "—"}</dd>
              <dt className="text-gray-500">Documents</dt><dd>{files.length} uploaded</dd>
            </dl>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
          <button onClick={() => setStep((s) => s - 1)} disabled={step === 0}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-30">
            ← Previous
          </button>
          {step < 4 ? (
            <button onClick={step <= 2 ? saveStep : () => setStep((s) => s + 1)} disabled={saving || (step === 0 && (!form.category_id || !form.sector_id || !form.project_name))}
              className="px-5 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 font-medium">
              {saving ? "Saving…" : "Next →"}
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={saving}
              className="px-5 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium">
              {saving ? "Submitting…" : "Submit Application ✓"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default function NewApplicationPage() {
  return (
    <ProtectedRoute allowedRoles={["project_proponent"]}>
      <DashboardLayout><NewApplicationContent /></DashboardLayout>
    </ProtectedRoute>
  );
}
