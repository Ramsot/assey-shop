"use client";

import { useState } from "react";
import { 
  Users as UsersIcon, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone,
  Calendar,
  CreditCard,
  Ticket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface UsersClientProps {
  initialUsers: any[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber?.includes(searchTerm) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-white/50 text-sm">Monitor and manage hotspot customers</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-blue-500/50 transition-all text-sm"
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Contact</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Activity</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30">Joined</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center font-bold text-blue-400">
                          {user.email?.[0].toUpperCase() || user.phoneNumber?.[0] || "U"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-white/90">{user.email || "Guest User"}</span>
                          <span className="text-[10px] text-white/30 font-mono">{user.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {user.email && (
                          <div className="flex items-center gap-2 text-xs text-white/50">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        )}
                        {user.phoneNumber && (
                          <div className="flex items-center gap-2 text-xs text-white/50">
                            <Phone className="w-3 h-3" />
                            {user.phoneNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <Ticket className="w-4 h-4 text-blue-400 mb-1" />
                          <span className="text-xs font-bold">{user._count?.vouchers || 0}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <CreditCard className="w-4 h-4 text-purple-400 mb-1" />
                          <span className="text-xs font-bold">{user._count?.payments || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-lg hover:bg-white/10 transition-all">
                        <MoreVertical className="w-5 h-5 text-white/30" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/30 text-sm italic">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
