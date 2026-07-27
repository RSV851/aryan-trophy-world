import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-[#090909] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C5A55A]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-xl space-y-6 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-[#C5A55A]/10 border border-[#C5A55A]/40 flex items-center justify-center text-[#C5A55A] mx-auto shadow-[0_0_30px_rgba(197,165,90,0.2)]">
          <Trophy className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif uppercase tracking-tight text-white">
            Aryan Trophy World
          </h1>
          <p className="text-xs sm:text-sm text-[#C5A55A] font-semibold uppercase tracking-widest">
            Prestige Award Showroom & Executive CMS
          </p>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
          Welcome to Aryan Trophy World. Access the Executive Administration Workspace to manage product catalogs, master classifications, media assets, and customer inquiries.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/admin/login">
            <Button className="w-full sm:w-auto bg-[#C5A55A] hover:bg-[#d5b568] text-[#090909] font-black uppercase text-xs h-12 px-8 rounded-xl shadow-[0_0_20px_rgba(197,165,90,0.3)] flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Enter Admin CMS</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
