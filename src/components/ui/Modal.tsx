import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Semi-transparent background overlay */}
      <div
        className="fixed inset-0 z-50 bg-gray-500 bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`relative max-w-md w-full bg-white rounded-lg shadow-xl ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          )}
          <div className="p-4">{children}</div>
        </div>
      </div>
    </>
  );
}
