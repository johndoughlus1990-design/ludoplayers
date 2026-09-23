import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";
import { toast } from "sonner";
import { CheckCircle2, Copy, CreditCard, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useUser, useWallet, walletTotal } from "@/lib/account";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/wallet")({ component: WalletPage });

const MERCHANT_UPI = "9636277797-7@ybl";
const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000, 10000];

function WalletPage() {
  const { user } = useUser();
  const { data: wallet } = useWallet(user?.id);
  const qc = useQueryClient();
  const [amount, setAmount] = useState(100);
  const [custom, setCustom] = useState("");
  const [utr, setUtr] = useState("");

  const selectedAmount = custom.trim() ? Number(custom) : amount;
  const validAmount = Number.isFinite(selectedAmount) && selectedAmount >= 10 && selectedAmount <= 100000;
  const upiUri = useMemo(() => validAmount
    ? "upi://pay?pa=" + encodeURIComponent(MERCHANT_UPI) + "&pn=" + encodeURIComponent("REAL LUDO PLAYER") + "&am=" + selectedAmount.toFixed(2) + "&cu=INR"
    : "", [selectedAmount, validAmount]);

  const { data: qrData } = useQuery({
    queryKey: ["deposit-qr", upiUri],
    enabled: !!upiUri,
    queryFn: () => QRCode.toDataURL(upiUri, { width: 280, margin: 2, errorCorrectionLevel: "M" }),
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please login first.");
      if (!validAmount) throw new Error("Enter a valid amount between ₹10 and ₹1,00,000.");
      const cleanUtr = utr.trim();
      if (cleanUtr.length < 6 || cleanUtr.length > 64) throw new Error("Please enter a valid UTR / transaction reference.");
      const { error } = await supabase.from("deposit_requests").insert({
        user_id: user.id, amount: selectedAmount, utr: cleanUtr, status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setUtr("");
      qc.invalidateQueries({ queryKey: ["deposit-requests"] });
      toast.success("Deposit request submitted. Admin will verify your UTR.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const copyUpi = async () => {
    await navigator.clipboard.writeText(MERCHANT_UPI);
    toast.success("UPI ID copied");
  };

  return (
    <AppShell title="Wallet">
      <div className="space-y-4">
        <div className="rounded-2xl border border-primary/30 bg-card p-5">
          <p className="text-xs text-muted-foreground">CURRENT CREDITS</p>
          <p className="mt-1 font-display text-3xl font-bold text-primary">{walletTotal(wallet)}</p>
        </div>

        <section className="rounded-2xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h1 className="font-display text-xl font-bold">Deposit Credits</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Select an amount and pay using the UPI QR.</p>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {QUICK_AMOUNTS.map((value) => (
              <button key={value} type="button" onClick={() => { setAmount(value); setCustom(""); }}
                className={"rounded-xl border px-3 py-3 text-sm font-bold transition " + (!custom && amount === value ? "border-primary bg-primary/10 text-primary" : "border-border bg-background")}>
                ₹{value.toLocaleString("en-IN")}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <label className="text-xs font-semibold text-muted-foreground">Custom Amount</label>
            <input inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Enter custom amount" className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
          </div>

          {validAmount ? (
            <div className="mt-5 rounded-2xl border border-primary/20 bg-background p-4 text-center">
              <p className="text-sm text-muted-foreground">Pay exactly</p>
              <p className="mt-1 font-display text-2xl font-bold text-primary">₹{selectedAmount.toLocaleString("en-IN")}</p>
              {qrData ? <img src={qrData} alt="UPI payment QR" className="mx-auto mt-3 h-64 w-64 rounded-xl bg-white p-2" /> : <Loader2 className="mx-auto mt-8 h-7 w-7 animate-spin" />}
              <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                <span className="font-semibold">{MERCHANT_UPI}</span>
                <button type="button" onClick={copyUpi} aria-label="Copy UPI ID"><Copy className="h-4 w-4 text-primary" /></button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Scan the QR from your UPI app and complete the payment.</p>
            </div>
          ) : <p className="mt-3 text-xs text-destructive">Enter a valid amount between ₹10 and ₹1,00,000.</p>}

          <div className="mt-5">
            <label className="text-sm font-semibold">UTR / Transaction Reference</label>
            <input value={utr} onChange={(e) => setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 64))}
              placeholder="Enter UTR after payment" className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" />
            <p className="mt-1 text-xs text-muted-foreground">Enter the UTR shown by your UPI app after successful payment.</p>
          </div>

          {utr.trim().length >= 6 ? (
            <Button className="mt-4 w-full" disabled={!validAmount || submit.isPending} onClick={() => submit.mutate()}>
              {submit.isPending ? "Submitting…" : "Submit Deposit Request"}
            </Button>
          ) : null}
        </section>

        <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-card p-4 text-xs text-muted-foreground">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          Credits are added only after an admin verifies the payment and approves the request.
        </div>
      </div>
    </AppShell>
  );
}
