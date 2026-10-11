import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Globe, Navigation } from 'lucide-react';
import type { Shop } from '@/types';
import { buildAffiliateUrl, buildGoogleMapsDirections } from '@/utils/affiliate';

interface ShopModalProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
}

const ShopModal: React.FC<ShopModalProps> = ({ shop, isOpen, onClose }) => {
  if (!shop) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {shop.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">{shop.rating}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{shop.location}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Contact Info */}
                <div className="space-y-3">
                  {shop.phone && (
                    <a
                      href={`tel:${shop.phone}`}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <Phone className="w-5 h-5 text-primary-600" />
                      <span className="font-medium text-gray-900">{shop.phone}</span>
                    </a>
                  )}
                  {shop.onlineStore && (
                    <a
                      href={buildAffiliateUrl(shop.onlineStore)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
                    >
                      <Globe className="w-5 h-5 text-primary-600" />
                      <span className="font-medium text-primary-700">
                        Visit Online Store
                      </span>
                    </a>
                  )}
                </div>

                {/* Branches */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Store Locations
                  </h3>
                  <div className="space-y-3">
                    {shop.branches.map((branch, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl p-4 hover:border-primary-300 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {branch.area}
                          </h4>
                          {branch.distance && (
                            <span className="text-sm text-primary-600 font-medium">
                              {branch.distance} km away
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {branch.address}
                        </p>
                        <a
                          href={buildGoogleMapsDirections(branch.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          <Navigation className="w-4 h-4" />
                          Get Directions
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShopModal;
