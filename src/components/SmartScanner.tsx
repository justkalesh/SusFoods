"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, ScanLine, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ExtractedItem {
  id: string;
  itemName: string;
  dateStocked: string;
  quantity: number;
  unit: string;
  price: number;
  predictedExpiryDate: string;
}

const LOADING_STEPS = [
  "Initializing AI Vision Module...",
  "Scanning receipt details...",
  "Identifying food items and categories...",
  "Extracting quantities and pricing...",
  "Predicting optical shelf-life and expiry dates...",
  "Finalizing data framework..."
];

export function SmartScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedItem[] | null>(null);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      interval = setInterval(() => {
        setScanStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 600);
    } else {
      setScanStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsScanning(true);
    setExtractedData(null);

    try {
      const formData = new FormData();
      formData.append("receipt", selectedFile);
      
      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData
      });
      
      const json = await res.json();
      
      if (json.success) {
        setExtractedData(json.data);
      } else {
        console.error("Scanning failed");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const handleItemChange = (id: string, field: keyof ExtractedItem, value: string | number) => {
    if (!extractedData) return;
    setExtractedData(extractedData.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleConfirm = async () => {
    if (!extractedData || extractedData.length === 0) return;

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to save inventory.");
        setSaving(false);
        return;
      }

      // Map each extracted item to a food_items row
      const rows = extractedData.map(item => ({
        donor_id: user.id,
        item_name: item.itemName,
        category: "Other" as const, // AI-scanned items default to "Other"
        quantity_kg: item.quantity,
        safe_to_consume_until: new Date(item.predictedExpiryDate).toISOString(),
        status: "Available" as const,
      }));

      const { error } = await supabase.from("food_items").insert(rows);

      if (error) {
        console.error("Insert error:", error);
        alert("Failed to save inventory: " + error.message);
        setSaving(false);
        return;
      }

      // Success — reset state
      setExtractedData(null);
      setFile(null);
      alert(`✅ ${rows.length} item${rows.length > 1 ? "s" : ""} added to your inventory successfully!`);
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/5 border-b-2 border-b-emerald-500/50 shadow-inner overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-heading">
          <ScanLine className="h-5 w-5 text-emerald-500" /> AI Receipt Scanner
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Upload a photo or PDF of your delivery invoice. Our AI model will automatically extract line items and predict optimal expiry dates based on item type.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* State 1: Upload Zone */}
        {!isScanning && !extractedData && (
          <div 
            className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden group
              ${isDragging ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500/70 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
              <UploadCloud className={`w-12 h-12 mb-4 transition-colors ${isDragging ? 'text-emerald-500 animate-bounce' : 'text-slate-400 dark:text-slate-500 group-hover:text-emerald-400'}`} />
              <p className="mb-2 text-lg font-semibold text-slate-700 dark:text-slate-200">
                <span className="text-emerald-600 dark:text-emerald-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Drop invoice or receipt here to auto-fill inventory
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">SVG, PNG, JPG, or PDF (MAX. 10MB)</p>
            </div>
            <input 
              ref={fileInputRef}
              id="dropzone-file" 
              type="file" 
              className="hidden" 
              accept=".pdf,image/*"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* State 2: AI Scanning Animation */}
        {isScanning && (
          <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/50 relative overflow-hidden">
            {/* Animated Scanning Beam */}
            <div className="absolute inset-x-0 h-4 bg-emerald-500/20 blur-md shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-[scan_2s_ease-in-out_infinite_alternate]"></div>
            
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-6 relative z-10" />
            
            <div className="flex flex-col items-center z-10">
              <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin mb-4" />
              <div className="h-6 overflow-hidden flex flex-col justify-end items-center text-emerald-600 dark:text-emerald-400 font-medium origin-bottom">
                <span key={scanStepIndex} className="animate-fade-in-up">{LOADING_STEPS[scanStepIndex]}</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">{file?.name}</p>
            </div>
          </div>
        )}

        {/* State 3: Human Review Data */}
        {extractedData && !isScanning && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-5 h-5" />
                Extraction Complete! Please review the data.
              </div>
              <Button variant="outline" size="sm" onClick={() => setExtractedData(null)} className="text-slate-600 border-slate-300 dark:border-white/10 dark:text-slate-300 dark:bg-slate-900">
                Cancel & Rescan
              </Button>
            </div>

            <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900 flex-none">
                  <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="w-[200px] text-slate-700 dark:text-slate-300 font-semibold">Item Name</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Date Stocked</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold w-24">Qty</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold">Unit</TableHead>
                    <TableHead className="text-slate-700 dark:text-slate-300 font-semibold w-24">Price ($)</TableHead>
                    <TableHead className="text-amber-600 dark:text-amber-500 font-bold bg-amber-50 dark:bg-amber-500/10">
                      <div className="flex items-center gap-1">
                        Predicted Expiry
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractedData.map((item) => (
                    <TableRow key={item.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                      <TableCell className="p-1">
                        <Input 
                          value={item.itemName} 
                          onChange={(e) => handleItemChange(item.id, 'itemName', e.target.value)}
                          className="h-9 border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 bg-transparent shadow-none"
                        />
                      </TableCell>
                      <TableCell className="p-1">
                        <Input 
                          type="date"
                          value={item.dateStocked} 
                          onChange={(e) => handleItemChange(item.id, 'dateStocked', e.target.value)}
                          className="h-9 border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 bg-transparent shadow-none"
                        />
                      </TableCell>
                      <TableCell className="p-1">
                        <Input 
                          type="number"
                          value={item.quantity} 
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))}
                          className="h-9 border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 bg-transparent shadow-none"
                        />
                      </TableCell>
                      <TableCell className="p-1">
                        <Input 
                          value={item.unit} 
                          onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                          className="h-9 border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 bg-transparent shadow-none"
                        />
                      </TableCell>
                      <TableCell className="p-1">
                        <Input 
                          type="number"
                          step="0.01"
                          value={item.price} 
                          onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value))}
                          className="h-9 border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 bg-transparent shadow-none"
                        />
                      </TableCell>
                      <TableCell className="p-1 bg-amber-50/50 dark:bg-amber-500/5 relative">
                        <Input 
                          type="date"
                          value={item.predictedExpiryDate} 
                          onChange={(e) => handleItemChange(item.id, 'predictedExpiryDate', e.target.value)}
                          className="h-9 border-amber-200 dark:border-amber-900/50 focus:border-amber-500 focus-visible:ring-amber-500 bg-transparent shadow-none relative z-10"
                        />
                        <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 className="w-3 h-3 text-amber-500" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button 
                onClick={handleConfirm}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all min-w-[200px]"
              >
                {saving ? (
                  <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Saving to Database...</>
                ) : (
                  "Confirm & Add to Inventory"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
