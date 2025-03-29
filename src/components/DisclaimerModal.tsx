"use client";

import React from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export default function DisclaimerModal({
  isOpen,
  onAccept,
}: DisclaimerModalProps) {
  return (
    <Dialog open={isOpen} onClose={() => {}} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/50 transition-opacity" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[430px]">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className=" flex flex-col justify-center items-center">
                <div className="mx-auto flex size-12 shrink-0 mb-3 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:size-10">
                  <ExclamationTriangleIcon
                    aria-hidden="true"
                    className="size-6 text-blue-600"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-0">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-gray-900 text-center"
                  >
                    Research and Educational Use Only
                  </DialogTitle>
                  <div className="mt-2 mb-1">
                    <p className="text-sm text-gray-500 text-center">
                      By proceeding, you acknowledge that you will use this tool
                      solely for research or educational purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-3 py-3 sm:flex sm:flex-row-reverse border-t border-gray-200">
              <button
                type="button"
                onClick={onAccept}
                className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500"
              >
                I Accept
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
