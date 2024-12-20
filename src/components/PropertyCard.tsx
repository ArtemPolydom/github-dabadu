import { useTranslation } from 'react-i18next';
import { Building2, FileText, Globe, MapPin } from 'lucide-react';

interface PropertyCardProps {
  name: string;
  address: string;
  country: string;
  state: string;
  description?: string;
  isParsingComplete: boolean;
}

export function PropertyCard({ name, address, country, state, description, isParsingComplete }: PropertyCardProps) {
  const { t } = useTranslation();

  const formatAddress = (fullAddress: string) => {
    const parts = fullAddress.split(',').map(part => part.trim());
    const addressParts = parts.filter(part => {
      return !part.match(/^[A-Z]\d[A-Z]\s+\d[A-Z]\d$/) && 
             !part.includes('United States') &&
             !part.includes('Canada');
    });
    return addressParts.slice(0, 2).join(', ');
  };

  const getLocation = () => {
    return `${state}, ${country === 'United States' ? 'USA' : country}`;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 flex flex-col">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
        <Building2 className="w-6 h-6 text-green-600" />
      </div>
      
      <h3 className="mt-4 text-xl font-semibold text-gray-900 text-center">
        {name}
      </h3>
      
      <div className="mt-4 space-y-3 mb-auto">
        <div className="flex items-start gap-3 text-gray-600">
          <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-left">{description || t('property.description.loading')}</p>
        </div>
        
        <div className="flex items-center gap-3 text-gray-600">
          <Globe className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm text-left">{getLocation()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-gray-600">
          <MapPin className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm text-left">{formatAddress(address)}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-500">{t('property.status.ai')}</p>
            {isParsingComplete ? (
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <p className="font-medium text-green-600">{t('property.status.ready')}</p>
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="animate-spin h-4 w-4 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="font-medium text-green-600">{t('property.status.parsing')}</p>
              </div>
            )}
          </div>
          <div>
            <p className="text-gray-500">{t('property.status.response')}</p>
            <p className="font-medium text-gray-900">{t('property.status.time')}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('property.status.availability')}</p>
            <p className="font-medium text-gray-900">{t('property.status.hours')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}