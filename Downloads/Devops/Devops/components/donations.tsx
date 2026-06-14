"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CircleDollarSign, Phone, UserRound, Plus, Trash2, Users, Calendar, Package, X, HeartHandshake, Search } from "lucide-react";
import { fetchAPI } from "../lib/api";

type DonatedItem = {
  id?: number;
  inventory_id: number;
  quantity: number;
};

type Donation = {
  id: number;
  name: string;
  phone_no: string;
  date_of_donation: string;
  items: DonatedItem[];
};

type InventoryItem = {
  id: number;
  name: string;
  categories_id: number;
  quantity: number;
  min_stock: number;
  monthly_usage: number;
  unit: string;
};

export default function Donations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dons, invs] = await Promise.all([
        fetchAPI("/donations"),
        fetchAPI("/inventory")
      ]);
      setDonations(dons);
      setInventoryItems(invs);
    } catch (error) {
      console.error("Failed to load donations data:", error);
    } finally {
      setLoading(false);
    }
  };

  const [isDonationFormOpen, setIsDonationFormOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [donationForm, setDonationForm] = useState({
    name: "",
    phone_no: "",
    date_of_donation: "",
    items: [{ inventory_id: "", quantity: "", itemName: "" }],
  });

  useEffect(() => {
    if (isDonationFormOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isDonationFormOpen]);

  const handleDonationSubmit = async () => {
    const validItems = donationForm.items
      .filter((item) => item.inventory_id !== "" && item.quantity !== "")
      .map((item) => ({
        inventory_id: Number(item.inventory_id),
        quantity: Number(item.quantity) || 0,
      }));

    if (!donationForm.name.trim() || !donationForm.phone_no.trim() || validItems.length === 0) return;

    const payload = {
      name: donationForm.name.trim(),
      phone_no: donationForm.phone_no.trim(),
      date_of_donation: donationForm.date_of_donation || new Date().toISOString().slice(0, 10),
      items: validItems,
    };

    try {
      const created = await fetchAPI("/donations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setDonations((prev) => [created, ...prev]);
      setDonationForm({
        name: "",
        phone_no: "",
        date_of_donation: "",
        items: [{ inventory_id: "", quantity: "", itemName: "" }],
      });
      setIsDonationFormOpen(false);
    } catch (error) {
      console.error("Failed to save donation:", error);
      alert("Failed to save donation");
    }
  };

  const addDonationItem = () => {
    setDonationForm((prev) => ({ ...prev, items: [...prev.items, { inventory_id: "", quantity: "", itemName: "" }] }));
  };

  const updateDonationItem = (index: number, field: "itemName" | "quantity", value: string) => {
    setDonationForm((prev) => {
      const newItems = [...prev.items];
      if (field === "itemName") {
        newItems[index].itemName = value;
        const matched = inventoryItems.find(i => i.name.toLowerCase() === value.toLowerCase());
        newItems[index].inventory_id = matched ? String(matched.id) : "";
      } else {
        newItems[index][field] = value as any;
      }
      return { ...prev, items: newItems };
    });
  };

  const removeDonationItem = (index: number) => {
    setDonationForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const totalDonationsUnits = donations.reduce((sum, d) => sum + d.items.reduce((s, item) => s + item.quantity, 0), 0);
  const totalDonors = new Set(donations.map((d) => d.phone_no)).size;
  const recentDonationsCount = donations.filter((d) => {
    const dDate = new Date(d.date_of_donation);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;
  const uniqueItemsDonated = new Set(donations.flatMap((d) => d.items.map((i) => i.inventory_id))).size;

  const filteredDonations = donations.filter((d) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [d.name, d.phone_no].join(" ").toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="p-8 text-center text-[#685942]">Loading data...</div>;
  }

  return (
    <div className="w-full h-full text-[#392d19]">


      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black text-[#1E314D] mb-3 tracking-tight">
            Donations
          </h2>
          <p className="text-lg text-[#685942] font-medium max-w-3xl leading-relaxed">
            Manage donor records and track incoming donated items.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsDonationFormOpen(true)}
            className="flex items-center gap-2 bg-[#F47C4D] text-white px-5 py-3 rounded-full font-semibold shadow-lg shadow-[#F47C4D]/25 hover:-translate-y-0.5 transition-all"
          >
            <HeartHandshake size={18} />
            Add Donation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatCard
          icon={<CircleDollarSign size={22} />}
          title="Donation Units"
          value={String(totalDonationsUnits)}
          helper="Items donated this month"
        />
        <StatCard
          icon={<Users size={22} />}
          title="Total Donors"
          value={String(totalDonors)}
          helper="Unique donors recorded"
        />
        <StatCard
          icon={<Calendar size={22} />}
          title="Recent Donations"
          value={String(recentDonationsCount)}
          helper="Donations in the last 30 days"
        />
        <StatCard
          icon={<Package size={22} />}
          title="Unique Items"
          value={String(uniqueItemsDonated)}
          helper="Different types of items donated"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="xl:col-span-6 space-y-6">
          <Panel
            title="Donations"
            subtitle="Store donor details with mobile number and donated items."
            icon={<UserRound size={18} />}
          >
            {isDonationFormOpen && mounted && createPortal(
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="shrink-0 z-10 px-6 py-5 flex items-center justify-between border-b border-[#eadbc5]">
                    <div>
                      <h3 className="text-2xl font-black text-[#1E314D] tracking-tight">
                        Add Donation Record
                      </h3>
                      <p className="text-sm text-[#685942] mt-1">Record donor details and items received.</p>
                    </div>
                    <button 
                      onClick={() => setIsDonationFormOpen(false)}
                      className="w-10 h-10 rounded-full bg-[#f3ede5] text-[#392d19] flex items-center justify-center hover:bg-[#eadbc5] transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="p-6 flex-1 overflow-y-auto">
                    <div className="space-y-4 mb-5">
                      <Input
                        label="Donor name"
                        value={donationForm.name}
                        onChange={(value) => setDonationForm((prev) => ({ ...prev, name: value }))}
                        placeholder="Full name"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Mobile"
                          value={donationForm.phone_no}
                          onChange={(value) => {
                            const numericValue = value.replace(/\D/g, "");
                            setDonationForm((prev) => ({ ...prev, phone_no: numericValue }));
                          }}
                          placeholder="10-digit number"
                          icon={<Phone size={16} />}
                        />
                        <Input
                          label="Date"
                          type="date"
                          value={donationForm.date_of_donation}
                          onChange={(value) => setDonationForm((prev) => ({ ...prev, date_of_donation: value }))}
                        />
                      </div>
                      
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-semibold text-[#5a5a5a]">Donated Items</label>
                          <button type="button" onClick={addDonationItem} className="text-sm text-[#F47C4D] font-bold hover:underline flex items-center gap-1">
                            <Plus size={14} /> Add Item
                          </button>
                        </div>
                        {donationForm.items.map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-end">
                            <div className="flex-1">
                              <label className="block text-sm font-semibold text-[#5a5a5a] mb-2">
                                {idx === 0 ? "Item name" : "\u00A0"}
                              </label>
                              <div className="relative">
                                <CustomDropdown
                                  value={item.itemName}
                                  onChange={(value) => updateDonationItem(idx, "itemName", value)}
                                  placeholder="Select an item..."
                                  options={inventoryItems.filter(opt => 
                                    !donationForm.items.some((otherItem, otherIdx) => otherIdx !== idx && otherItem.inventory_id === String(opt.id))
                                  )}
                                />
                              </div>
                            </div>
                            <div className="w-24">
                              <Input
                                label={idx === 0 ? "Quantity" : "\u00A0"}
                                type="number"
                                value={item.quantity}
                                onChange={(value) => updateDonationItem(idx, "quantity", value)}
                                placeholder="Qty"
                              />
                            </div>
                            {donationForm.items.length > 1 && (
                              <button type="button" onClick={() => removeDonationItem(idx)} className="mb-[2px] w-[50px] h-[50px] flex-shrink-0 flex items-center justify-center rounded-2xl bg-[#fff3ee] text-[#c1552f] hover:bg-[#ffe9e0] transition-colors border border-[#ffd8ca]">
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-[#eadbc5]">
                      <button
                        onClick={handleDonationSubmit}
                        className="rounded-full bg-[#1F1A3A] text-white px-5 py-3 font-semibold hover:-translate-y-0.5 transition-all shadow-md"
                      >
                        Add Donation Record
                      </button>
                      <button
                        onClick={() => setIsDonationFormOpen(false)}
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

            <div className="relative mb-5">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7f735f]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search donor name, mobile, or items..."
                className="w-full rounded-2xl border border-[#eadbc5] bg-[#fffaf4] pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#F47C4D]/25"
              />
            </div>

            <div className="overflow-x-auto rounded-[1.5rem] border border-[#efe3d3]">
              <table className="w-full min-w-[820px]">
                <thead className="bg-[#fff5ea] text-left">
                  <tr className="text-[#5a5a5a] text-sm">
                    <th className="px-4 py-4 font-bold">Donor Name</th>
                    <th className="px-4 py-4 font-bold">Mobile</th>
                    <th className="px-4 py-4 font-bold">Date</th>
                    <th className="px-4 py-4 font-bold">Items Donated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDonations.map((donation) => (
                    <tr key={donation.id} className="border-t border-[#f1e5d6] bg-white">
                      <td className="px-4 py-4 font-semibold text-[#1E314D]">{donation.name}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-[#685942]">
                          <Phone size={14} /> {donation.phone_no}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[#7f735f]">{donation.date_of_donation}</td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {donation.items.map((item, idx) => {
                            const itemName = inventoryItems.find(i => i.id === item.inventory_id)?.name || "Unknown Item";
                            return (
                              <div key={idx} className="flex justify-between items-center bg-[#fffaf4] rounded-lg px-3 py-1.5 border border-[#eadbc5]">
                                <span className="text-sm font-medium text-[#392d19]">{itemName}</span>
                                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#b07b00] border border-[#f4e2b1]">
                                  Qty: {item.quantity}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDonations.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-[#7f735f] font-medium">
                        No donations found for your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

// Subcomponents (copied from store-room.tsx for self-containment)

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

function CustomDropdown({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { id: number; name: string }[];
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      // Calculate coords
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  const filteredOptions = options.filter(opt => opt.name.toLowerCase().includes(search.toLowerCase()));
  
  return (
    <div className="relative" ref={triggerRef} onClick={(e) => e.stopPropagation()}>
      <div 
        className="w-full rounded-2xl border border-[#eadbc5] bg-[#fffaf4] px-4 py-3 outline-none cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-[#1E314D]" : "text-gray-400"}>
          {value || placeholder}
        </span>
      </div>
      {isOpen && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed z-[99999] bg-white border border-[#eadbc5] rounded-2xl shadow-[0_16px_40px_rgba(31,26,58,0.1)] max-h-60 flex flex-col overflow-hidden"
          style={{ top: coords.top, left: coords.left, width: coords.width }}
        >
          <div className="sticky top-0 bg-white p-2 border-b border-[#eadbc5] z-10">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-3 py-2 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-[#F47C4D]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="px-4 py-2 cursor-pointer rounded-xl hover:bg-[#fff3ee] hover:text-[#c1552f] text-sm text-[#392d19] transition-colors"
                  onClick={() => {
                    onChange(opt.name);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  {opt.name}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">No items found</div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
