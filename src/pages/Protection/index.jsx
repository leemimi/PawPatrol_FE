import React, { useState, useEffect } from 'react';

const Protection = () => {
  const [animals, setAnimals] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const getStatusText = (status) => {
    switch (status) {
      case 'PROTECTION_POSSIBLE':
        return '임보가능';
      case 'PROTECTION_IMPOSSIBLE':
        return '임보불가';
      case 'PROTECTION_COMPLETE':
        return '임보완료';
      default:
        return status;
    }
  };

  const fetchAnimals = async () => {
    console.log('Attempting to fetch animals...');
    try {
      setLoading(true);
      console.log('API URL:', `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/protections?page=${page}&size=10`);
      const response = await fetch(
        `${import.meta.env.VITE_CORE_API_BASE_URL}/api/v1/protections?page=${page}&size=10`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      console.log('Response:', response);

      if (response.ok) {
        const data = await response.json();
        console.log('Data received:', data);
        if (data.resultCode === "200") {
          setAnimals(data.data.content);
        }
      }
    } catch (error) {
      console.error('Error in fetchAnimals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, [page]); // fetchAnimals도 의존성에 추가해야 할 수 있습니다.

  return (
    <div className="max-w-lg mx-auto bg-orange-50/30 min-h-screen p-3">
      <div className="flex flex-col gap-3">
        {loading ? (
          <div>로딩중...</div>
        ) : (
          animals.map((animal, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-100">
              <div className="relative">
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${animal.caseStatus === 'PROTECTION_POSSIBLE'
                    ? 'bg-red-400 text-white'
                    : 'bg-orange-300 text-white'
                    }`}>
                    {getStatusText(animal.caseStatus)}
                  </span>
                </div>
              </div>

              <div className="p-3.5">
                <h3 className="text-sm font-medium text-gray-900 mb-1.5">
                  {animal.animalName}
                </h3>
                <div className="mt-2 text-xs text-gray-500">
                  등록일: {new Date(animal.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">
                  수정일: {new Date(animal.modifiedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Protection;