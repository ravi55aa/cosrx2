import React from "react";

const AddressModal = ({ addresses = [], onSelect, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-lg space-y-5 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold text-gray-800">Select Address</h2>

        {addresses.length === 0 ? (
          <p className="text-gray-500">No address results found.</p>
        ) : (
          <div className="space-y-4">
            {addresses.map((address, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
              >
                <p><span className="font-medium">State:</span> {address.State}</p>
                <p><span className="font-medium">District:</span> {address.District}</p>
                <p><span className="font-medium">Region:</span> {address.Region || "N/A"}</p>
                <p><span className="font-medium">Town:</span> {address.Name}</p>
                <button
                  type="button"
                  onClick={() =>{ onSelect(address)}}
                  className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
