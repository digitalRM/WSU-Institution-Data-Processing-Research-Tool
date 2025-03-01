import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchInstitutionData } from "@/utils/institutionApi";
import { InstitutionData } from "@/types/institution";
import { ChevronUp, PencilRuler, Search } from "lucide-react";

interface DebugMenuProps {
  bearerToken: string;
  hasAcceptedDisclaimer: boolean;
}

export default function DebugMenu({
  bearerToken,
  hasAcceptedDisclaimer,
}: DebugMenuProps) {
  const [institutionCode, setInstitutionCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<
    (Partial<InstitutionData> & { debug?: any }) | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showRawResponse, setShowRawResponse] = useState(false);

  const handleTest = async () => {
    if (!institutionCode.trim()) {
      setError("Please enter an institution code");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetchInstitutionData(institutionCode, bearerToken);
      setResult(data);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      if ((error as any).debug) {
        setResult({ debug: (error as any).debug });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="mt-6 mx-auto">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="text-sm tracking-tight text-neutral-600 hover:text-neutral-800 rounded-full shadow-sm h-9"
        >
          <Search className="w-4 h-4 mr-2" />
          Open Individual Lookup
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-neutral-200">
      <div className="p-5 pb-4 rounded-t-2xl bg-neutral-50/50 flex justify-between items-center">
        <h2 className=" font-medium tracking-tight text-neutral-900">
          Search Institution
        </h2>
        <Button
          onClick={() => setIsOpen(false)}
          variant="outline"
          size="sm"
          className="text-sm text-neutral-600 hover:text-neutral-800 rounded-full pr-3 pl-2 h-7"
        >
          <ChevronUp className="w-4 h-4 mr-1" />
          Hide
        </Button>
      </div>

      <div className="p-5 pt-4 border-t border-neutral-200">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="institution-code">
              Institution Code <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="institution-code"
                placeholder="Enter institution code (e.g., HT#)"
                value={institutionCode}
                onChange={(e) => setInstitutionCode(e.target.value)}
                disabled={!bearerToken || !hasAcceptedDisclaimer || isLoading}
                className="bg-white/50"
              />
              <Button
                onClick={handleTest}
                disabled={
                  !bearerToken ||
                  !hasAcceptedDisclaimer ||
                  isLoading ||
                  !institutionCode.trim()
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? "Testing..." : "Test"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <p className="font-semibold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-neutral-800">
                    Institution Data:
                  </p>
                  {result.debug && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRawResponse(!showRawResponse)}
                      className="text-xs"
                    >
                      {showRawResponse ? "Show Summary" : "Show Raw Response"}
                    </Button>
                  )}
                </div>

                {!showRawResponse ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white p-2 rounded border border-neutral-100">
                        <span className="font-medium">Institution Name:</span>{" "}
                        {result.institutionName}
                      </div>
                      <div className="bg-white p-2 rounded border border-neutral-100">
                        <span className="font-medium">Library Type:</span>{" "}
                        {result.libraryType}
                      </div>
                      <div className="bg-white p-2 rounded border border-neutral-100">
                        <span className="font-medium">Location:</span>{" "}
                        {result.City}, {result.State}, {result.Country}
                      </div>
                      <div className="bg-white p-2 rounded border border-neutral-100">
                        <span className="font-medium">Postal Code:</span>{" "}
                        {result.postalCd}
                      </div>
                      <div className="bg-white p-2 rounded border border-neutral-100">
                        <span className="font-medium">Coordinates:</span>{" "}
                        {result.latitude}, {result.longitude}
                      </div>
                    </div>

                    {result.debug && (
                      <div className="mt-4 space-y-2">
                        <p className="font-semibold text-neutral-800">
                          Debug Information:
                        </p>
                        <div className="bg-white p-3 rounded border border-neutral-100 text-sm">
                          <p>
                            <span className="font-medium">Original Code:</span>{" "}
                            {result.debug.originalCode}
                          </p>
                          <p>
                            <span className="font-medium">Encoded Code:</span>{" "}
                            {result.debug.encodedCode}
                          </p>
                          <p>
                            <span className="font-medium">Status:</span>{" "}
                            {result.debug.finalStatus}
                          </p>
                          <p>
                            <span className="font-medium">Attempts:</span>{" "}
                            {result.debug.attempts.length}
                          </p>

                          {result.debug.attempts.map(
                            (attempt: any, index: number) => (
                              <div
                                key={index}
                                className="mt-2 p-2 bg-neutral-50 rounded border border-neutral-100"
                              >
                                <p>
                                  <span className="font-medium">
                                    Attempt {attempt.attempt}:
                                  </span>{" "}
                                  {attempt.status}
                                </p>
                                {attempt.statusCode && (
                                  <p>
                                    <span className="font-medium">
                                      Status Code:
                                    </span>{" "}
                                    {attempt.statusCode}
                                  </p>
                                )}
                                {attempt.errorStatus && (
                                  <p>
                                    <span className="font-medium">
                                      Error Status:
                                    </span>{" "}
                                    {attempt.errorStatus}
                                  </p>
                                )}
                                {attempt.hasEntry !== undefined && (
                                  <p>
                                    <span className="font-medium">
                                      Found Entry:
                                    </span>{" "}
                                    {attempt.hasEntry ? "Yes" : "No"}
                                  </p>
                                )}
                                <p className="text-xs truncate">
                                  <span className="font-medium">URL:</span>{" "}
                                  {attempt.url}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <pre className="text-xs overflow-auto p-3 bg-white border border-neutral-200 rounded-md max-h-80">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
