"use client";

import { useState, useEffect } from "react";
import { Boxes, Building2, Pencil, Trash2 } from "lucide-react";
import { fetchAPI } from "../lib/api";

type Category = {
  id: number;
  name: string;
  description: string;
};

type Department = {
  id: number;
  dept_name: string;
  dept_lead: string;
  notes: string;
};

export default function CategoriesDepartments() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(null);

  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [departmentForm, setDepartmentForm] = useState({ dept_name: "", dept_lead: "", notes: "" });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, depts] = await Promise.all([
        fetchAPI("/categories"),
        fetchAPI("/departments")
      ]);
      setCategories(cats);
      setDepartments(depts);
    } catch (error) {
      console.error("Failed to load categories/departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", description: "" });
    setEditingCategoryId(null);
  };

  const resetDepartmentForm = () => {
    setDepartmentForm({ dept_name: "", dept_lead: "", notes: "" });
    setEditingDepartmentId(null);
  };

  const handleCategorySubmit = async () => {
    if (!categoryForm.name.trim()) return;

    try {
      if (editingCategoryId !== null) {
        const updated = await fetchAPI(`/categories/${editingCategoryId}`, {
          method: "PUT",
          body: JSON.stringify(categoryForm),
        });
        setCategories((prev) => prev.map((c) => (c.id === editingCategoryId ? updated : c)));
      } else {
        const created = await fetchAPI("/categories", {
          method: "POST",
          body: JSON.stringify(categoryForm),
        });
        setCategories((prev) => [...prev, created]);
      }
      resetCategoryForm();
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Failed to save category");
    }
  };

  const handleDepartmentSubmit = async () => {
    if (!departmentForm.dept_name.trim()) return;

    try {
      if (editingDepartmentId !== null) {
        const updated = await fetchAPI(`/departments/${editingDepartmentId}`, {
          method: "PUT",
          body: JSON.stringify(departmentForm),
        });
        setDepartments((prev) => prev.map((d) => (d.id === editingDepartmentId ? updated : d)));
      } else {
        const created = await fetchAPI("/departments", {
          method: "POST",
          body: JSON.stringify(departmentForm),
        });
        setDepartments((prev) => [...prev, created]);
      }
      resetDepartmentForm();
    } catch (error) {
      console.error("Failed to save department:", error);
      alert("Failed to save department");
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setCategoryForm({ name: category.name, description: category.description || "" });
  };

  const startEditDepartment = (department: Department) => {
    setEditingDepartmentId(department.id);
    setDepartmentForm({ dept_name: department.dept_name, dept_lead: department.dept_lead, notes: department.notes || "" });
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await fetchAPI(`/categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category");
    }
  };

  const deleteDepartment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      await fetchAPI(`/departments/${id}`, { method: "DELETE" });
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Failed to delete department:", error);
      alert("Failed to delete department");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#685942]">Loading data...</div>;
  }

  return (
    <div className="w-full h-full text-[#392d19]">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#1E314D] mb-3 tracking-tight">
            Departments & Categories
          </h2>
          <p className="text-lg text-[#685942] font-medium max-w-3xl leading-relaxed">
            Manage organization departments and item categories for the storeroom.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel
          title="Item Categories"
          subtitle="Create, modify, or remove inventory categories."
          icon={<Boxes size={18} />}
        >
          <div className="space-y-4 mb-5">
            <Input
              label="Category name"
              value={categoryForm.name}
              onChange={(value) => setCategoryForm((prev) => ({ ...prev, name: value }))}
              placeholder="Ex: Medical Equipment"
            />
            <TextArea
              label="Description"
              value={categoryForm.description}
              onChange={(value) => setCategoryForm((prev) => ({ ...prev, description: value }))}
              placeholder="Short note about this category"
            />
          </div>

          <div className="flex gap-3 mb-5">
            <button
              onClick={handleCategorySubmit}
              className="rounded-full bg-[#F47C4D] text-white px-5 py-3 font-semibold shadow-md"
            >
              {editingCategoryId !== null ? "Update Category" : "Add Category"}
            </button>
            <button
              onClick={resetCategoryForm}
              className="rounded-full bg-[#f3ede5] text-[#392d19] px-5 py-3 font-semibold"
            >
              Reset
            </button>
          </div>

          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="rounded-[1.5rem] border border-[#efe3d3] bg-[#fffaf4] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#1E314D]">{category.name}</p>
                    <p className="text-sm text-[#685942] mt-1">{category.description || "No description added yet."}</p>
                  </div>
                  <div className="flex gap-2">
                    <IconButton icon={<Pencil size={16} />} onClick={() => startEditCategory(category)} label="Edit category" />
                    <IconButton icon={<Trash2 size={16} />} onClick={() => deleteCategory(category.id)} label="Delete category" danger />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Departments"
          subtitle="Create departments and allocate which departments require each item."
          icon={<Building2 size={18} />}
        >
          <div className="space-y-4 mb-5">
            <Input
              label="Department name"
              value={departmentForm.dept_name}
              onChange={(value) => setDepartmentForm((prev) => ({ ...prev, dept_name: value }))}
              placeholder="Ex: Surgery"
            />
            <Input
              label="Department lead"
              value={departmentForm.dept_lead}
              onChange={(value) => setDepartmentForm((prev) => ({ ...prev, dept_lead: value }))}
              placeholder="Department in-charge"
            />
            <TextArea
              label="Notes"
              value={departmentForm.notes}
              onChange={(value) => setDepartmentForm((prev) => ({ ...prev, notes: value }))}
              placeholder="What this department typically needs"
            />
          </div>

          <div className="flex gap-3 mb-5">
            <button
              onClick={handleDepartmentSubmit}
              className="rounded-full bg-[#1F1A3A] text-white px-5 py-3 font-semibold shadow-md"
            >
              {editingDepartmentId !== null ? "Update Department" : "Create Department"}
            </button>
            <button
              onClick={resetDepartmentForm}
              className="rounded-full bg-[#f3ede5] text-[#392d19] px-5 py-3 font-semibold"
            >
              Reset
            </button>
          </div>

          <div className="space-y-3">
            {departments.map((department) => (
              <div key={department.id} className="rounded-[1.5rem] border border-[#efe3d3] bg-[#fffaf4] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#1E314D]">{department.dept_name}</p>
                    <p className="text-sm text-[#685942] mt-1">Lead: {department.dept_lead || "Not assigned"}</p>
                    <p className="text-sm text-[#7b6b56] mt-2">{department.notes || "No notes yet."}</p>
                  </div>
                  <div className="flex gap-2">
                    <IconButton icon={<Pencil size={16} />} onClick={() => startEditDepartment(department)} label="Edit department" />
                    <IconButton icon={<Trash2 size={16} />} onClick={() => deleteDepartment(department.id)} label="Delete department" danger />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

// Subcomponents
function Panel({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] bg-white border border-[#eadbc5] shadow-[0_16px_40px_rgba(31,26,58,0.05)] p-6 lg:p-7">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#fff1e8] text-[#F47C4D] flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-black text-[#1E314D] tracking-tight">{title}</h3>
          <p className="text-sm text-[#685942] mt-1 leading-relaxed">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function IconButton({
  icon,
  onClick,
  label,
  danger = false,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
        danger
          ? "border-[#ffd8ca] bg-[#fff3ee] text-[#c1552f] hover:bg-[#ffe9e0]"
          : "border-[#eadbc5] bg-white text-[#1E314D] hover:border-[#F47C4D] hover:text-[#F47C4D]"
      }`}
    >
      {icon}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#5a5a5a] mb-2">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7f735f]">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-[#eadbc5] bg-[#fffaf4] px-4 py-3 outline-none focus:ring-2 focus:ring-[#F47C4D]/25 ${
            icon ? "pl-11" : ""
          }`}
        />
      </div>
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#5a5a5a] mb-2">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-2xl border border-[#eadbc5] bg-[#fffaf4] px-4 py-3 outline-none focus:ring-2 focus:ring-[#F47C4D]/25 resize-none"
      />
    </div>
  );
}
