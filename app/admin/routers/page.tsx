import { getRouters } from "@/modules/admin/admin.actions";
import { 
  Router as RouterIcon, 
  Plus, 
  Settings, 
  Activity, 
  Signal, 
  SignalLow,
  Shield,
  Trash2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function RoutersPage() {
  const routers = await getRouters();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Router Management</h1>
          <p className="text-white/50 text-sm">Monitor and configure MikroTik devices</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all text-sm font-bold shadow-lg shadow-blue-600/20">
          <Plus className="w-4 h-4" />
          Add Router
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routers.length > 0 ? (
          routers.map((router) => (
            <div key={router.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/[0.08] transition-all group relative overflow-hidden">
              {/* Background Glow */}
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full -mr-16 -mt-16 transition-opacity opacity-20",
                router.status === "ONLINE" ? "bg-green-500" : "bg-red-500"
              )} />

              <div className="flex items-start justify-between mb-6 relative">
                <div className={cn(
                  "p-3 rounded-2xl",
                  router.status === "ONLINE" ? "bg-green-500/10" : "bg-red-500/10"
                )}>
                  <RouterIcon className={cn(
                    "w-6 h-6",
                    router.status === "ONLINE" ? "text-green-400" : "text-red-400"
                  )} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                    router.status === "ONLINE" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", router.status === "ONLINE" ? "bg-green-400" : "bg-red-400")} />
                    {router.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4 relative">
                <div>
                  <h3 className="text-lg font-bold group-hover:text-blue-400 transition-colors">{router.name}</h3>
                  <p className="text-white/30 text-xs font-mono">{router.ipAddress}:{router.apiPort}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                  <div>
                    <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider mb-1">Active Users</p>
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-bold">{router._count.sessions}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider mb-1">Total Vouchers</p>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-bold">{router._count.vouchers}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4">
                    <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/btn">
                      <Settings className="w-4 h-4 text-white/40 group-hover/btn:text-white" />
                    </button>
                    <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/btn text-red-400/50 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Sync Status
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-white/5 border border-white/10 border-dashed rounded-3xl text-center">
            <RouterIcon className="w-16 h-16 mx-auto mb-6 text-white/10" />
            <h3 className="text-xl font-bold mb-2">No Routers Connected</h3>
            <p className="text-white/30 max-w-sm mx-auto mb-8 text-sm">Add your first MikroTik router to start managing hotspot vouchers and sessions.</p>
            <button className="bg-blue-600 px-6 py-3 rounded-2xl font-bold hover:bg-blue-500 transition-all">
              Add Router Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
