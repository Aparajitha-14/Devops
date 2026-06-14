"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const backendUrl = process.env.BACKEND_URL || "http://localhost:8000/";
      const res = await fetch(`${backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await res.json();
      const token = data.access_token;

      // Set cookie using document.cookie for simplicity. 
      // It will be sent with subsequent requests to our domain.
      document.cookie = `admin_token=${token}; path=/; max-age=3600; SameSite=Strict`;
      localStorage.setItem("token", token);

      router.push("/admin");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] font-sans">
      <div className="w-full max-w-md overflow-hidden bg-white rounded-3xl shadow-2xl shadow-[#1E314D]/10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header/Branding Area */}
        <div className="bg-[#1E314D] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>
          
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-[#1E314D] font-black text-4xl tracking-tighter">C.</span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-1">CARE</h1>
              <p className="text-xs uppercase tracking-widest text-primary/80 font-bold">Workspace Login</p>
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="p-8 pb-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-[#1E314D] mb-1.5">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="block w-full px-4 py-3 text-[#1E314D] bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium outline-none placeholder:text-gray-400"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[#1E314D] mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full px-4 py-3 text-[#1E314D] bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium outline-none placeholder:text-gray-400"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl text-center animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 mt-2 text-white bg-[#1E314D] hover:bg-[#152336] rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#1E314D]/20 flex items-center justify-center gap-2"
            >
              Sign In to Workspace
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
