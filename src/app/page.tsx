"use client";

import { useId, useState, useRef } from "react";
import * as XLSX from "xlsx-js-style";
import { InstitutionData } from "@/types/institution";
import { fetchInstitutionData } from "@/utils/institutionApi";
import LogTable from "@/components/LogTable";
import DisclaimerModal from "@/components/DisclaimerModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StopIcon } from "@heroicons/react/24/solid";
import { ArrowUpRightIcon, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Home() {
  const tokenId = useId();
  const fileId = useId();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bearerToken, setBearerToken] = useState("");
  const [logs, setLogs] = useState<
    Array<InstitutionData & { timestamp: string }>
  >([]);
  const [processedWorkbook, setProcessedWorkbook] =
    useState<XLSX.WorkBook | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

  // Refs for controlling the process
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentFileRef = useRef<File | null>(null);
  const currentIndexRef = useRef<number>(0);
  const dataRef = useRef<InstitutionData[]>([]);

  const handleAcceptDisclaimer = () => {
    setShowDisclaimer(false);
    setHasAcceptedDisclaimer(true);
  };

  const stopProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessing(false);
    setIsPaused(false);
    currentIndexRef.current = 0;
    dataRef.current = [];
  };

  const processFileData = async (
    jsonData: InstitutionData[],
    startIndex: number = 0
  ) => {
    if (!bearerToken || !hasAcceptedDisclaimer) return;

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      const total = jsonData.length;
      const updatedData = startIndex > 0 ? [...dataRef.current] : [];

      for (let i = startIndex; i < total; i++) {
        if (signal.aborted) {
          throw new Error("Processing aborted");
        }

        if (isPaused) {
          currentIndexRef.current = i;
          dataRef.current = updatedData;
          return;
        }

        const row = jsonData[i];
        try {
          const data = await fetchInstitutionData(
            row.institution_identifier,
            bearerToken
          );
          const updatedRow = { ...row, ...data };
          updatedData.push(updatedRow);

          setLogs((prev) => [
            ...prev,
            {
              ...updatedRow,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);

          setProgress(Math.round(((i + 1) / total) * 100));
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("Authentication failed")
          ) {
            alert(
              "Authentication failed. Please check your token and try again."
            );
            stopProcessing();
            return;
          }
          // For other errors, continue processing with NoneFound values
          console.error(`Error processing row ${i}:`, error);
          const updatedRow = {
            ...row,
            latitude: "NoneFound",
            longitude: "NoneFound",
            libTypeUser: "NoneFound",
            institutionName: "NoneFound",
            City: "NoneFound",
            State: "NoneFound",
            Country: "NoneFound",
            postalCd: "NoneFound",
          };
          updatedData.push(updatedRow);
          setLogs((prev) => [
            ...prev,
            {
              ...updatedRow,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        }
      }

      const newWorkbook = XLSX.utils.book_new();
      const newWorksheet = XLSX.utils.json_to_sheet(updatedData);

      const headerStyle = {
        font: { bold: true },
        fill: { fgColor: { rgb: "EFEFEF" } },
      };

      const range = XLSX.utils.decode_range(newWorksheet["!ref"] || "A1");
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!newWorksheet[address]) continue;
        newWorksheet[address].s = headerStyle;
      }

      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Updated Data");
      setProcessedWorkbook(newWorkbook);
      setIsProcessing(false);
      currentIndexRef.current = 0;
      dataRef.current = [];
    } catch (error) {
      if (error instanceof Error && error.message !== "Processing aborted") {
        console.error("Error processing file:", error);
        alert("Error processing file. Please try again.");
      }
    }
  };

  const processFile = async (file: File) => {
    if (!bearerToken) {
      alert("Please enter a bearer token first");
      return;
    }

    if (!hasAcceptedDisclaimer) {
      alert("Please accept the research disclaimer first");
      setShowDisclaimer(true);
      return;
    }

    // Stop any existing process
    stopProcessing();

    setIsProcessing(true);
    setProgress(0);
    setLogs([]); // Clear previous logs
    setProcessedWorkbook(null); // Clear previous workbook
    currentFileRef.current = file;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<InstitutionData>(worksheet);
      dataRef.current = jsonData;

      await processFileData(jsonData);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedWorkbook) {
      const randomId = Math.random().toString(36).substring(7);
      XLSX.writeFile(
        processedWorkbook,
        `updated_institutions_${randomId}.xlsx`
      );
    }
  };

  return (
    <>
      <DisclaimerModal
        isOpen={showDisclaimer}
        onAccept={handleAcceptDisclaimer}
      />

      <div className="min-h-screen bg-neutral-50 p-4 lg:p-8">
        <main className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold text-black mb-4 mt-4 md:mt-8 tracking-tight">
            Institution Data Processing Research Tool
          </h1>
          <p className="text-sm text-neutral-600 mb-6">
            This project, which was originally built as an internal tool for{" "}
            <a
              href="https://www.wsu.edu/"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              Washington State University
            </a>{" "}
            research through the{" "}
            <a
              href="https://www.ukrainianbookproject.com/"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              Ukrainian Book Project
            </a>
            , is now available to anyone for research and educational purposes.
            We are not affiliated with OCLC in any way. This tool utilizes the{" "}
            <a
              href="https://developer.api.oclc.org/wc-registry"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              OCLC Registry API
            </a>{" "}
            and requires that you have access to the API. This tool is entirely
            open source and available on{" "}
            <a
              href="https://github.com/digitalRM/WSU-Institution-Data-Processing-Research-Tool"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              GitHub
            </a>
            .
          </p>

          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200">
            <div className="p-5 pb-6 rounded-t-2xl bg-neutral-50/50">
              <div className="space-y-2 relative">
                <Label htmlFor={tokenId} className="">
                  Bearer Token / Access Token{" "}
                  <span className="text-destructive">*</span>{" "}
                  <a
                    href="https://www.oclc.org/developer/develop/authentication/access-tokens/explicit-authorization-code.en.html"
                    target="_blank"
                    className="hover:text-blue-600"
                  >
                    <Info
                      strokeWidth={2}
                      className="h-4 w-4 inline-block absolute right-0"
                    />
                  </a>
                </Label>
                <Input
                  id={tokenId}
                  placeholder="Enter your token"
                  type="text"
                  className="bg-white/50"
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                  disabled={!hasAcceptedDisclaimer}
                  required
                />
              </div>
            </div>

            <div className="p-5 pt-4 border-t border-neutral-200">
              <Label htmlFor={fileId}>
                Upload Excel File <span className="text-destructive">*</span>
              </Label>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-fit">
                      <input
                        id={fileId}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) processFile(file);
                        }}
                        className={`block w-fit max-w-[80vw] mt-2 text-sm text-neutral-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        file:cursor-not-allowed
                        cursor-not-allowed
                        ${
                          !bearerToken &&
                          "opacity-50 cursor-not-allowed file:hover:bg-blue-50"
                        }
                        ${
                          bearerToken &&
                          "hover:file:bg-blue-100 cursor-pointer file:cursor-pointer"
                        }
                        `}
                        disabled={!bearerToken || !hasAcceptedDisclaimer}
                      />
                    </div>
                  </TooltipTrigger>
                  {!bearerToken && (
                    <TooltipContent
                      side="right"
                      sideOffset={-60}
                      className="bg-blue-50 text-blue-700 border border-blue-100"
                    >
                      <p className="">
                        Please enter your Bearer Token or Access Token to enable
                        file upload
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>

            {isProcessing && (
              <div className="p-5 border-t bg-neutral-50 rounded-b-2xl border-neutral-200">
                <div className="flex justify-between w-full">
                  <div className="w-full">
                    <div className="w-full mb-1 mt-2 bg-neutral-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-neutral-600 mt-2">
                      {isPaused ? "Paused" : "Processing..."} {progress}%
                    </p>
                  </div>
                  <button
                    onClick={stopProcessing}
                    className="inline-flex ml-3 items-center gap-1 bg-red-600 pl-2 pr-3 tracking-tight w-fit h-7 text-xs text-white font-bold rounded-md hover:bg-red-700 transition-colors"
                  >
                    <StopIcon className="h-4 w-4" /> Stop
                  </button>
                </div>
              </div>
            )}

            {processedWorkbook && !isProcessing && !isPaused && (
              <div className="p-5 bg-neutral-50 rounded-b-2xl border-t border-neutral-200">
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 text-white px-3 text-sm py-1.5 font-semibold tracking-tight rounded-md hover:bg-blue-700 transition-colors"
                >
                  Download Processed File
                </button>
              </div>
            )}
          </div>

          <LogTable logs={logs} />

          <div className="mt-6 flex justify-between flex-col lg:flex-row gap-4">
            <p className="text-sm text-neutral-600">
              A tool by{" "}
              <a
                href="https://www.ruslan.in"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Ruslan Mukhamedvaleev
              </a>{" "}
              for the{" "}
              <a
                href="https://www.ukrainianbookproject.com/"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                Ukrainian Book Project
              </a>{" "}
              of Washington State University.
            </p>
            <div className="text-sm text-neutral-600">
              © {new Date().getFullYear()} ·{" "}
              <a
                href="https://github.com/digitalRM/WSU-Institution-Data-Processing-Research-Tool"
                target="_blank"
                className="hover:underline"
              >
                View GitHub{" "}
                <ArrowUpRightIcon className="-ml-0.5 h-4 w-4 inline-block" />
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
