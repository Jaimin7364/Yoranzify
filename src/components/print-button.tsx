"use client";
import { Printer } from "lucide-react";

export function PrintButton({ label = "Print / Save PDF" }: { label?: string }) { return <button className="button button-dark print-action" type="button" onClick={() => window.print()}><Printer size={16} />{label}</button>; }
