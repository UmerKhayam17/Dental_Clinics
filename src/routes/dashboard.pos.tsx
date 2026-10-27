import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money } from "@/lib/data";
import { billTotal, findVariant, lineTotal, printSheet, removeProduct, saveBill, saveProduct, useHms, type PosLine, type PosProduct, type PosVariant } from "@/lib/hms";
import { Empty, PageTitle, Restricted, Stat } from "./dashboard";

export const Route = createFileRoute("/dashboard/pos")({
  validateSearch: (s: Record<string, unknown>): { panel: "sell" | "products" | "bills" | "summary" } => ({
    panel: s.panel === "products" || s.panel === "bills" || s.panel === "summary" ? s.panel : "sell",
  }),
  component: PosPage,
});

function PosPage() {
  const { panel } = Route.useSearch();
  const [s] = useHms();
  const title = panel === "products" ? "inventory" : panel === "bills" ? "bills" : panel === "summary" ? "summary" : "dashboard";
  return (
    <Restricted allow={["Owner", "Branch Manager", "Receptionist", "Accountant"]}>
      <PageTitle title={title} sub="Scan a barcode or search a product, hold a bill, or take payment. Stock changes only when the bill is paid. Saved in this browser." />
      {panel === "sell" && <Sell />}
      {panel === "products" && <Products />}
      {panel === "bills" && <Bills />}
      {panel === "summary" && <Summary stateProducts={s.products.filter((p) => p.active).length} />}
    </Restricted>
  );
}

function Sell() {
  const [s] = useHms();
  const [barcode, setBarcode] = useState("");
  const [q, setQ] = useState("");
  const [lines, setLines] = useState<PosLine[]>([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [method, setMethod] = useState("cash");
  const matches = s.products.filter((p) => p.active && p.name.toLowerCase().includes(q.toLowerCase())).flatMap((p) => p.variants.map((v) => ({ p, v })));

  const add = (product: PosProduct, variant: PosVariant) => {
    setLines((curr) => {
      const hit = curr.find((l) => l.variantId === variant.id);
      if (hit) return curr.map((l) => l.variantId === variant.id ? { ...l, qty: l.qty + 1 } : l);
      return [...curr, { productId: product.id, variantId: variant.id, name: product.name, size: variant.size, color: variant.color, barcode: variant.barcode, qty: 1, price: variant.sell, discount: product.discount }];
    });
  };

  const scan = () => {
    const found = findVariant(s, barcode);
    if (!found) return toast.error("No product uses that barcode");
    add(found.product, found.variant);
    setBarcode("");
  };

  const finish = (hold: boolean) => {
    const message = saveBill({ lines, customerName: name, customerContact: contact, paymentMethod: method, hold });
    if (message) return toast.error(message);
    toast.success(hold ? "Bill held" : "Payment taken");
    if (!hold) printSheet("Sale slip", `<p>${name || "Walk-up"} · ${method}</p><table>${lines.map((l) => `<tr><td>${l.name} × ${l.qty}</td><td>${money(lineTotal(l))}</td></tr>`).join("")}<tr><th>Total</th><td>${money(billTotal(lines))}</td></tr></table>`);
    setLines([]); setName(""); setContact("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <div>
        <div className="mb-3 flex gap-2">
          <Input placeholder="Barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && scan()} aria-label="Barcode" />
          <Button variant="outline" onClick={scan}>Scan</Button>
        </div>
        <Input placeholder="Search products" className="mb-3" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
        <div className="grid gap-2 sm:grid-cols-2">
          {matches.map(({ p, v }) => (
            <button key={v.id} className="rounded-xl border bg-card p-3 text-left hover:bg-muted/40" onClick={() => add(p, v)}>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{v.size} · {v.color} · {v.barcode}</p>
              <p className="mt-1 text-sm">{money(v.sell)} · {v.stock} in stock</p>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <h2 className="font-display text-lg text-primary">Bill</h2>
        {lines.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Scan a barcode or choose a product.</p>}
        {lines.map((l) => (
          <div key={l.variantId} className="mt-3 flex items-center justify-between gap-2 text-sm">
            <div><p>{l.name}</p><p className="text-xs text-muted-foreground">{l.barcode}</p></div>
            <Input className="h-8 w-16" type="number" aria-label={`Quantity of ${l.name}`} value={l.qty} onChange={(e) => setLines(lines.map((x) => x.variantId === l.variantId ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x))} />
            <span>{money(lineTotal(l))}</span>
            <Button size="sm" variant="ghost" onClick={() => setLines(lines.filter((x) => x.variantId !== l.variantId))}>Remove</Button>
          </div>
        ))}
        <p className="mt-4 font-medium">Total {money(billTotal(lines))}</p>
        <div className="mt-3 grid gap-2">
          <Input placeholder="Customer name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Customer name" />
          <Input placeholder="Contact" value={contact} onChange={(e) => setContact(e.target.value)} aria-label="Customer contact" />
          <Select value={method} onValueChange={setMethod}><SelectTrigger aria-label="Payment"><SelectValue /></SelectTrigger><SelectContent>{["cash", "card", "bank_transfer", "online"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={() => finish(false)}>Take payment</Button>
          <Button variant="outline" onClick={() => finish(true)}>Hold bill</Button>
        </div>
      </div>
    </div>
  );
}

function Products() {
  const [s] = useHms();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Home care");
  const [brand, setBrand] = useState("");
  const [barcode, setBarcode] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [stock, setStock] = useState(0);
  const [buy, setBuy] = useState(0);
  const [sell, setSell] = useState(0);
  const save = () => {
    const variant: PosVariant = { id: "", size, color, barcode, stock, buy, sell };
    const message = saveProduct({ name, category, brand, description: "", discount: 0, active: true, variants: [variant] });
    if (message) return toast.error(message);
    toast.success("Product saved");
    setName(""); setBarcode("");
  };
  return (
    <div>
      <div className="mb-4 grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4">
        <div><Label htmlFor="pn">Name</Label><Input id="pn" className="mt-1" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label htmlFor="pc">Category</Label><Input id="pc" className="mt-1" value={category} onChange={(e) => setCategory(e.target.value)} /></div>
        <div><Label htmlFor="pb">Brand</Label><Input id="pb" className="mt-1" value={brand} onChange={(e) => setBrand(e.target.value)} /></div>
        <div><Label htmlFor="pbar">Barcode</Label><Input id="pbar" className="mt-1" value={barcode} onChange={(e) => setBarcode(e.target.value)} /></div>
        <div><Label htmlFor="ps">Size</Label><Input id="ps" className="mt-1" value={size} onChange={(e) => setSize(e.target.value)} /></div>
        <div><Label htmlFor="pcol">Colour</Label><Input id="pcol" className="mt-1" value={color} onChange={(e) => setColor(e.target.value)} /></div>
        <div><Label htmlFor="pst">Stock</Label><Input id="pst" type="number" className="mt-1" value={stock} onChange={(e) => setStock(Number(e.target.value) || 0)} /></div>
        <div><Label htmlFor="pbu">Buy / sell</Label><div className="mt-1 flex gap-2"><Input id="pbu" type="number" value={buy} onChange={(e) => setBuy(Number(e.target.value) || 0)} aria-label="Buy price" /><Input type="number" value={sell} onChange={(e) => setSell(Number(e.target.value) || 0)} aria-label="Sell price" /></div></div>
        <div className="md:col-span-4"><Button onClick={save}>Add product</Button></div>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-3">Product</th><th className="p-3">Variant</th><th className="p-3">Barcode</th><th className="p-3">Stock</th><th className="p-3">Price</th><th className="p-3 text-right">Hide</th></tr></thead>
          <tbody className="divide-y">
            {s.products.filter((p) => p.active).flatMap((p) => p.variants.map((v) => (
              <tr key={v.id}>
                <td className="p-3">{p.name}<span className="block text-xs text-muted-foreground">{p.brand} · {p.category}</span></td>
                <td className="p-3">{v.size} / {v.color}</td>
                <td className="p-3">{v.barcode}</td>
                <td className="p-3">{v.stock}</td>
                <td className="p-3">{money(v.sell)}</td>
                <td className="p-3 text-right"><Button size="sm" variant="ghost" onClick={() => removeProduct(p.id)}>Hide</Button></td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Bills() {
  const [s] = useHms();
  const complete = (id: string) => {
    const bill = s.bills.find((b) => b.id === id);
    if (!bill) return;
    const message = saveBill({ lines: bill.lines, customerName: bill.customerName, customerContact: bill.customerContact, paymentMethod: bill.paymentMethod, hold: false, heldId: bill.id });
    if (message) toast.error(message);
    else toast.success("Held bill paid and stock updated");
  };
  if (!s.bills.length) return <Empty title="No bills" body="A paid or held sale will show here." />;
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-3">Bill</th><th className="p-3">Customer</th><th className="p-3">Status</th><th className="p-3">Total</th><th className="p-3 text-right">Actions</th></tr></thead>
        <tbody className="divide-y">
          {s.bills.map((b) => (
            <tr key={b.id}>
              <td className="p-3">{b.id}<span className="block text-xs text-muted-foreground">{b.date}</span></td>
              <td className="p-3">{b.customerName || "Walk-up"}</td>
              <td className="p-3">{b.status}</td>
              <td className="p-3">{money(b.total)}</td>
              <td className="p-3 text-right">
                {b.status === "held" && <Button size="sm" className="mr-2" onClick={() => complete(b.id)}>Take payment</Button>}
                <Button size="sm" variant="outline" onClick={() => printSheet(`Bill ${b.id}`, `<p>${b.customerName || "Walk-up"} · ${b.status}</p><table>${b.lines.map((l) => `<tr><td>${l.name} × ${l.qty}</td><td>${money(lineTotal(l))}</td></tr>`).join("")}</table><p>Total ${money(b.total)}</p>`)}>Print</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Summary({ stateProducts }: { stateProducts: number }) {
  const [s] = useHms();
  const paid = s.bills.filter((b) => b.status === "paid");
  const held = s.bills.filter((b) => b.status === "held");
  const today = new Date().toISOString().slice(0, 10);
  const todayPaid = paid.filter((b) => b.date === today).reduce((a, b) => a + b.total, 0);
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <Stat label="Paid today" value={money(todayPaid)} />
      <Stat label="All paid sales" value={money(paid.reduce((a, b) => a + b.total, 0))} hint={`${paid.length} bills`} />
      <Stat label="Held" value={held.length} hint={money(held.reduce((a, b) => a + b.total, 0))} />
      <Stat label="Active products" value={stateProducts} />
    </div>
  );
}
