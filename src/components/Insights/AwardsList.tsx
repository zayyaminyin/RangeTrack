import React from 'react';
import { Award } from '../../types';
import { AwardIcon } from 'lucide-react';
interface AwardsListProps {
  awards: Award[];
}
export const AwardsList: React.FC<AwardsListProps> = ({
  awards
}) => {
  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  if (awards.length === 0) {
    return <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="flex justify-center mb-3">
          <AwardIcon size={32} className="text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-700 mb-1">No Awards Yet</h3>
        <p className="text-sm text-gray-500">
          Keep logging your farm activities to earn awards!
        </p>
      </div>;
  }
  // Group awards by month
  const groupedAwards: Record<string, Award[]> = {};
  awards.forEach(award => {
    const date = new Date(award.earned_ts);
    const monthYear = `${date.toLocaleString('default', {
      month: 'long'
    })} ${date.getFullYear()}`;
    if (!groupedAwards[monthYear]) {
      groupedAwards[monthYear] = [];
    }
    groupedAwards[monthYear].push(award);
  });
  return <div className="space-y-6">
      {Object.entries(groupedAwards).map(([monthYear, monthAwards]) => <div key={monthYear}>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            {monthYear}
          </h3>
          <div className="space-y-3">
            {monthAwards.map(award => <div key={award.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-amber-100 rounded-full p-2 mr-3">
                    <AwardIcon size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{award.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{award.reason}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Earned on {formatDate(award.earned_ts)}
                    </p>
                  </div>
                </div>
              </div>)}
          </div>
        </div>)}
    </div>;
};