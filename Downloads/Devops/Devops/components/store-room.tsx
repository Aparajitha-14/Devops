"use client";

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { fetchAPI } from "../lib/api";
import {
  Boxes,
  Building2,
  CircleDollarSign,
  ClipboardList,
  PackagePlus,
  Pencil,
  Phone,
  Plus,
  Search,
  Download,
  Trash2,
  TriangleAlert,
  UserRound,
  Warehouse,
  X,
} from "lucide-react";

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

type DepartmentAllocated = {
  id: number;
  inventory_id: number;
  department_id: number;
};

type InventoryItem = {
  id: number;
  name: string;
  categories_id: number;
  allocated_departments: DepartmentAllocated[];
  quantity: number;
  min_stock: number;
  monthly_usage: number;
  unit: string;
};

export default function StoreRoom() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, depts, invs] = await Promise.all([
        fetchAPI("/categories"),
        fetchAPI("/departments"),
        fetchAPI("/inventory")
      ]);
      setCategories(cats);
      setDepartments(depts);
      setItems(invs);
    } catch (error) {
      console.error("Failed to load store room data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [search, setSearch] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    categories_id: "1",
    quantity: "",
    min_stock: "",
    monthly_usage: "",
    unit: "",
    department_ids: [] as number[],
  });


  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const category = categories.find((c) => c.id === item.categories_id)?.name ?? "";
      const deptNames = item.allocated_departments
        .map((alloc) => departments.find((d) => d.id === alloc.department_id)?.dept_name ?? "")
        .join(" ");
      return [item.name, category, deptNames].join(" ").toLowerCase().includes(q);
    });
  }, [items, categories, departments, search]);

  const lowStockItems = items.filter((item) => item.quantity <= item.min_stock);
  const restockPlan = items.map((item) => ({
    ...item,
    suggestedOrder: Math.max(item.monthly_usage - item.quantity, 0),
  }));
  const totalInventoryUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalItemTypes = items.length;
  const itemsToRestock = restockPlan.filter((i) => i.suggestedOrder > 0).length;
  const exportRestockToCSV = () => {
    const data = restockPlan.filter(item => item.suggestedOrder > 0);
    if (data.length === 0) {
      alert("No items need to be restocked right now.");
      return;
    }

    const headers = ["Product Name", "Stock Needed"];
    const rows = data.map(item => `"${item.name}","${item.suggestedOrder} ${item.unit}"`);
    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "end_of_month_restock.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (isItemFormOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isItemFormOpen]);

  const resetItemForm = () => {
    setItemForm({
      name: "",
      categories_id: categories[0] ? String(categories[0].id) : "1",
      quantity: "",
      min_stock: "",
      monthly_usage: "",
      unit: "",
      department_ids: [],
    });
    setEditingItemId(null);
    setIsItemFormOpen(false);
  };

  const handleItemSubmit = async () => {
    if (!itemForm.name.trim() || !itemForm.unit.trim()) return;

    const payload = {
      name: itemForm.name.trim(),
      categories_id: Number(itemForm.categories_id),
      quantity: Number(itemForm.quantity) || 0,
      min_stock: Number(itemForm.min_stock) || 0,
      monthly_usage: Number(itemForm.monthly_usage) || 0,
      unit: itemForm.unit.trim(),
      department_ids: itemForm.department_ids,
    };

    try {
      if (editingItemId !== null) {
        const updated = await fetchAPI(`/inventory/${editingItemId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setItems((prev) => prev.map((item) => (item.id === editingItemId ? updated : item)));
      } else {
        const created = await fetchAPI("/inventory", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setItems((prev) => [created, ...prev]);
      }
      resetItemForm();
    } catch (error) {
      console.error("Failed to save inventory item:", error);
      alert("Failed to save inventory item");
    }
  };





  const startEditItem = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setItemForm({
      name: item.name,
      categories_id: String(item.categories_id),
      quantity: String(item.quantity),
      min_stock: String(item.min_stock),
      monthly_usage: String(item.monthly_usage),
      unit: item.unit,
      department_ids: item.allocated_departments.map(d => d.department_id),
    });
    setIsItemFormOpen(true);
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await fetchAPI(`/inventory/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Failed to delete item");
    }
  };

  const toggleDepartmentForItem = (deptId: number) => {
    setItemForm((prev) => ({
      ...prev,
      department_ids: prev.department_ids.includes(deptId)
        ? prev.department_ids.filter((id) => id !== deptId)
        : [...prev.department_ids, deptId],
    }));
  };

  const getCategoryName = (id: number) => categories.find((category) => category.id === id)?.name ?? "Unknown";
  const getDepartmentNames = (allocations: DepartmentAllocated[]) =>
    allocations.map((alloc) => departments.find((d) => d.id === alloc.department_id)?.dept_name).filter(Boolean).join(", ");

  if (loading) {
    return <div className="p-8 text-center text-[#685942]">Loading data...</div>;
  }

  return (
    <div className="w-full h-full text-[#392d19]">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#1E314D] mb-3 tracking-tight">
            Store Room Management
          </h2>
          <p className="text-lg text-[#685942] font-medium max-w-3xl leading-relaxed">
            Track inventory, monitor low stock, and estimate end-of-month restocking from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="flex items-center gap-2 bg-white border border-[#e6d2b5] px-5 py-3 rounded-full font-semibold shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <ClipboardList size={18} />
            {showSummary ? "Inventory Items" : "Inventory Summary"}
          </button>
          <button
            onClick={() => {
              resetItemForm();
              setIsItemFormOpen(true);
            }}
            className="flex items-center gap-2 bg-[#F47C4D] text-white px-5 py-3 rounded-full font-semibold shadow-lg shadow-[#F47C4D]/25 hover:-translate-y-0.5 transition-all"
          >
            <PackagePlus size={18} />
            Add inventory item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          icon={<Boxes size={22} />}
          title="Inventory Units"
          value={String(totalInventoryUnits)}
          helper="Total units available across all items"
        />
        <StatCard
          icon={<TriangleAlert size={22} />}
          title="Low Stock Items"
          value={String(lowStockItems.length)}
          helper="Items at or below minimum threshold"
          accent="alert"
        />
        <StatCard
          icon={<ClipboardList size={22} />}
          title="Total Item Types"
          value={String(totalItemTypes)}
          helper="Unique items tracked in inventory"
        />
        <StatCard
          icon={<PackagePlus size={22} />}
          title="Items to Restock"
          value={String(itemsToRestock)}
          helper="Items below monthly usage requirements"
        />
      </div>

      {isItemFormOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="shrink-0 z-10 px-6 py-5 flex items-center justify-between border-b border-[#eadbc5]">
              <div>
                <h3 className="text-2xl font-black text-[#1E314D] tracking-tight">
                  {editingItemId !== null ? "Edit Item" : "Add Inventory Item"}
                </h3>
                <p className="text-sm text-[#685942] mt-1">Fill in the details for the stock item.</p>
              </div>
              <button
                onClick={() => setIsItemFormOpen(false)}
                className="w-10 h-10 rounded-full bg-[#f3ede5] text-[#392d19] flex items-center justify-center hover:bg-[#eadbc5] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <Input
                  label="Item name"
                  value={itemForm.name}
                  onChange={(value) => setItemForm((prev) => ({ ...prev, name: value }))}
                  placeholder="Ex: Antibiotic Syrup"
                />
                <div>
                  <label className="block text-sm font-semibold text-[#5a5a5a] mb-2">Category</label>
                  <select
                    value={itemForm.categories_id}
                    onChange={(e) => setItemForm((prev) => ({ ...prev, categories_id: e.target.value }))}
                    className="w-full rounded-2xl border border-[#eadbc5] bg-[#fffaf4] px-4 py-3 outline-none focus:ring-2 focus:ring-[#F47C4D]/25"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Quantity"
                  type="number"
                  value={itemForm.quantity}
                  onChange={(value) => setItemForm((prev) => ({ ...prev, quantity: value }))}
                  placeholder="0"
                />
                <Input
                  label="Minimum stock"
                  type="number"
                  value={itemForm.min_stock}
                  onChange={(value) => setItemForm((prev) => ({ ...prev, min_stock: value }))}
                  placeholder="0"
                />
                <Input
                  label="Monthly usage"
                  type="number"
                  value={itemForm.monthly_usage}
                  onChange={(value) => setItemForm((prev) => ({ ...prev, monthly_usage: value }))}
                  placeholder="0"
                />
                <Input
                  label="Unit"
                  value={itemForm.unit}
                  onChange={(value) => setItemForm((prev) => ({ ...prev, unit: value }))}
                  placeholder="boxes / strips / packs"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#5a5a5a] mb-3">Allocate item to departments</label>
                <div className="flex flex-wrap gap-3">
                  {departments.map((department) => {
                    const active = itemForm.department_ids.includes(department.id);
                    return (
                      <button
                        key={department.id}
                        type="button"
                        onClick={() => toggleDepartmentForItem(department.id)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all border ${active
                            ? "bg-[#F47C4D] text-white border-[#F47C4D] shadow-md"
                            : "bg-white text-[#392d19] border-[#eadbc5] hover:border-[#F47C4D]"
                          }`}
                      >
                        {department.dept_name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#eadbc5]">
                <button
                  onClick={handleItemSubmit}
                  className="rounded-full bg-[#1F1A3A] text-white px-5 py-3 font-semibold hover:-translate-y-0.5 transition-all shadow-md"
                >
                  {editingItemId !== null ? "Update Item" : "Add Item"}
                </button>
                <button
                  onClick={() => setIsItemFormOpen(false)}
                  className="rounded-full bg-[#f3ede5] text-[#392d19] px-5 py-3 font-semibold hover:bg-[#eadbc5] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="grid grid-cols-1 gap-6">
        {!showSummary ? (
          <div className="space-y-6">
            <Panel
              title="Inventory Items"
              subtitle="View all stock items, thresholds, and department allocation."
              icon={<Warehouse size={18} />}
            >
              <div className="relative mb-5">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7f735f]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search items, categories, or departments"
                  className="w-full rounded-2xl border border-[#eadbc5] bg-[#fffaf4] pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#F47C4D]/25"
                />
              </div>

              <div className="overflow-x-auto rounded-[1.5rem] border border-[#efe3d3]">
                <table className="w-full min-w-[820px]">
                  <thead className="bg-[#fff5ea] text-left">
                    <tr className="text-[#5a5a5a] text-sm">
                      <th className="px-4 py-4 font-bold">Item</th>
                      <th className="px-4 py-4 font-bold">Category</th>
                      <th className="px-4 py-4 font-bold">Departments</th>
                      <th className="px-4 py-4 font-bold">Stock</th>
                      <th className="px-4 py-4 font-bold">Min</th>
                      <th className="px-4 py-4 font-bold">Monthly Usage</th>
                      <th className="px-4 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const isLow = item.quantity <= item.min_stock;
                      return (
                        <tr key={item.id} className="border-t border-[#f1e5d6] bg-white">
                          <td className="px-4 py-4 font-semibold text-[#1E314D]">{item.name}</td>
                          <td className="px-4 py-4">{getCategoryName(item.categories_id)}</td>
                          <td className="px-4 py-4">{getDepartmentNames(item.allocated_departments) || "Not assigned"}</td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${isLow ? "bg-[#ffe3d8] text-[#b54726]" : "bg-[#eef6ee] text-[#2e7d32]"}`}>
                              {item.quantity} {item.unit}
                            </span>
                          </td>
                          <td className="px-4 py-4">{item.min_stock}</td>
                          <td className="px-4 py-4">{item.monthly_usage}</td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <IconButton icon={<Pencil size={16} />} onClick={() => startEditItem(item)} label="Edit item" />
                              <IconButton icon={<Trash2 size={16} />} onClick={() => deleteItem(item.id)} label="Delete item" danger />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-[#7f735f] font-medium">
                          No items found for your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Panel
                title="Low Stock Overview"
                subtitle="Quick view of inventory items that need urgent attention."
                icon={<TriangleAlert size={18} />}
              >
                <div className="space-y-3">
                  {lowStockItems.length > 0 ? (
                    lowStockItems.map((item) => (
                      <div key={item.id} className="rounded-[1.4rem] border border-[#ffd9cb] bg-[#fff3ee] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-[#1E314D]">{item.name}</p>
                            <p className="text-sm text-[#9a5a42]">{getCategoryName(item.categories_id)}</p>
                          </div>
                          <span className="text-xs font-bold rounded-full bg-white px-3 py-1 text-[#c1552f]">
                            {item.quantity}/{item.min_stock}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#685942] font-medium">Everything is above the minimum threshold right now.</p>
                  )}
                </div>
              </Panel>
            </div>

            <div className="space-y-6">
              <Panel
                title="End-of-Month Restock"
                subtitle="Estimate how much stock should be procured based on current stock and monthly usage."
                icon={<Plus size={18} />}
              >
                <div className="flex justify-end mb-4">
                  <button
                    onClick={exportRestockToCSV}
                    className="flex items-center gap-2 bg-[#1F1A3A] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-md"
                  >
                    <Download size={16} />
                    Export to CSV
                  </button>
                </div>
                <div className="space-y-3">
                  {restockPlan.map((item) => (
                    <div key={item.id} className="rounded-[1.4rem] border border-[#efe3d3] bg-[#fffaf4] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-[#1E314D]">{item.name}</p>
                          <p className="text-sm text-[#685942] mt-1">
                            Current: {item.quantity} {item.unit} · Monthly usage: {item.monthly_usage}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.suggestedOrder > 0 ? "bg-[#1F1A3A] text-white" : "bg-[#edf6ed] text-[#2e7d32]"}`}>
                          {item.suggestedOrder > 0 ? `Order ${item.suggestedOrder}` : "Sufficient"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

function StatCard({
  icon,
  title,
  value,
  helper,
  accent = "default",
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  helper: string;
  accent?: "default" | "alert";
}) {
  const accentClass =
    accent === "alert"
      ? "bg-[#fff0eb] border-[#ffd8ca] text-[#c95c33]"
      : "bg-white border-[#eadbc5] text-[#F47C4D]";

  return (
    <div className="rounded-[1.8rem] border bg-white p-5 shadow-[0_10px_25px_rgba(31,26,58,0.04)]">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-sm font-semibold text-[#685942]">{title}</p>
          <p className="text-3xl font-black text-[#1E314D] mt-2">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${accentClass}`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-[#7f735f] leading-relaxed">{helper}</p>
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
      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${danger
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
          className={`w-full rounded-2xl border border-[#eadbc5] bg-[#fffaf4] px-4 py-3 outline-none focus:ring-2 focus:ring-[#F47C4D]/25 ${icon ? "pl-11" : ""
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
